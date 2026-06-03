import fs from "fs";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

// Initialize the Stripe client lazily
const getStripeClient = () => {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    console.warn("⚠️ WARNING: STRIPE_SECRET_KEY has not been configured in your environment variables.");
    return null;
  }
  return new Stripe(apiKey, { apiVersion: "2023-10-16" as any });
};

// Initialize the Resend client lazily
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn(
      "⚠️ WARNING: RESEND_API_KEY has not been configured in your environment variables. Email notification features will be skipped."
    );
    return null;
  }

  return new Resend(apiKey);
};

// Robust function to handle Sandbox restrictions and custom domain mismatches smoothly
async function safeSendEmail(
  resendClient: any,
  options: {
    from: string;
    to: string;
    subject: string;
    html: string;
  }
): Promise<boolean> {
  const primaryFrom = options.from;
  const primaryTo = options.to;
  const primarySubject = options.subject;

  // Since unverified domains (like gmail.com or custom domains not set up) fail, 
  // let's detect if we should automatically use the standard onboarding address
  let attemptFrom = primaryFrom;
  if (primaryFrom.includes("@gmail.com") || primaryFrom.includes("onboarding@resend.dev")) {
    attemptFrom = "onboarding@resend.dev";
  }

  try {
    const result = await resendClient.emails.send({
      from: attemptFrom,
      to: primaryTo,
      subject: primarySubject,
      html: options.html,
    });
    
    if (result.error) {
      throw result.error;
    }
    console.log(`[Resend OK] Email sent successfully to ${primaryTo}`);
    return true;
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    console.warn(`[Resend PRE-CATCH] Direct send to [${primaryTo}] failed (Error: ${errMsg}). Activating sandbox fallback...`);
    
    // In Sandbox mode, you can only mail the verified onboarding owner. Let's dynamically extract it if present!
    const extractedEmails: string[] = [];
    const match = errMsg.match(/your own email address \(([^)]+)\)/i);
    if (match && match[1]) {
      console.log(`[Resend Auto-Heal] Extracted sandbox verified email from Resend message: ${match[1]}`);
      extractedEmails.push(match[1]);
    }

    // Standard high-probability addresses
    const sandboxFallbackRecipients = [
      ...extractedEmails,
      "villaleopardi2024@gmail.com",
      "zorziriccardo06@gmail.com",
      "zorziriccardo20@gmail.com",
      process.env.ADMIN_EMAIL
    ].filter((email): email is string => !!email)
     .filter((email, index, self) => self.indexOf(email) === index);

    let fallbackSuccess = false;
    for (const fallbackTo of sandboxFallbackRecipients) {
      try {
        console.log(`[Resend Fallback] Sending to verified receiver ${fallbackTo}...`);
        const cleanFrom = "onboarding@resend.dev"; 
        const wrappedSubject = `[SANDBOX REDIRECTED: TO ${primaryTo}] ${primarySubject}`;
        
        const result = await resendClient.emails.send({
          from: cleanFrom,
          to: fallbackTo,
          subject: wrappedSubject,
          html: options.html,
        });

        if (result.error) {
          throw result.error;
        }

        console.log(`[Resend OK] Fallback simulation generated successfully to: ${fallbackTo}`);
        fallbackSuccess = true;
        break;
      } catch (fallbackErr: any) {
        console.error(`[Resend Fail] Sandbox fallback to ${fallbackTo} failed:`, fallbackErr?.message || fallbackErr);
      }
    }

    if (!fallbackSuccess) {
      console.error("[Resend FATAL] All email paths failed. Please verify your RESEND_API_KEY environment variable.");
      return false;
    }
    return true;
  }
}

// Set to store processed session IDs
const processedSessions = new Set<string>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Immediate Stripe diagnostics test on server boot
  const runStripeDiagnostic = async () => {
    console.log("🔍 Running Stripe API diagnostic...");
    const stripe = getStripeClient();
    if (!stripe) {
      fs.writeFileSync("stripe-test-result.json", JSON.stringify({
        status: "error",
        error: "STRIPE_SECRET_KEY is missing/undefined in environment variables."
      }, null, 2));
      return;
    }
    try {
      // Direct Stripe Balance check to verify secret key correctness
      const balance = await stripe.balance.retrieve();
      let accountName = "N/A";
      try {
        // accounts.retrieve requires an account ID in this SDK version. 
        // Since balance.retrieve already succeeded, the key is certified valid.
        accountName = "Primary Connected Account (Stripe API Key validated)";
      } catch (acctErr) {
        // Restricted keys may not allow account retrieval, which is expected & OK
        accountName = "Restricted key (Access allowed to basic functions, but full identity reads restricted)";
      }
      
      fs.writeFileSync("stripe-test-result.json", JSON.stringify({
        status: "success",
        message: "Stripe connection verified successfully!",
        account: accountName,
        balance_type: balance.object,
        timestamp: new Date().toISOString()
      }, null, 2));
      console.log(`✅ Stripe API Diagnostic Success: connected to account [${accountName}]`);
    } catch (err: any) {
      console.error("❌ Stripe API Diagnostic Failed:", err.message || err);
      fs.writeFileSync("stripe-test-result.json", JSON.stringify({
        status: "error",
        error: err.message || String(err),
        raw_error: err,
        timestamp: new Date().toISOString()
      }, null, 2));
    }
  };

  runStripeDiagnostic();

  // On-demand diagnostic endpoint
  app.get("/api/test-stripe", async (req, res) => {
    const stripe = getStripeClient();
    if (!stripe) {
      return res.status(500).json({ status: "error", error: "STRIPE_SECRET_KEY is not configured on the server." });
    }
    try {
      const balance = await stripe.balance.retrieve();
      let accountName = "N/A";
      try {
        // accounts.retrieve requires an account ID in this SDK version.
        // Balance retrieve already succeeded, certifying the key is valid.
        accountName = "Primary Connected Account (Stripe API Key validated)";
      } catch (acctErr) {
        accountName = "Restricted Key (Basic balance accessed, full details restricted)";
      }
      res.json({
        status: "success",
        message: "Stripe API Key is valid!",
        account: accountName,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(400).json({
        status: "error",
        error: err.message || String(err)
      });
    }
  });

  // API Route for Stripe Checkout
  app.post("/api/create-checkout-session", async (req, res) => {
    const { name, guests, phone, email, message } = req.body;
    
    const stripe = getStripeClient();
    
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured on the server." });
    }

    const PRICE_PER_PERSON_CENTS = 5000; // 50€

    try {
      const domain = req.headers.origin || `http://localhost:${PORT}`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Sunset Table - ${guests} Ospiti`,
                description: `Prenotazione a nome di ${name} per l'evento Sunset Table presso Villa Leopardi.`,
              },
              unit_amount: PRICE_PER_PERSON_CENTS,
            },
            quantity: parseInt(guests || "1"),
          }
        ],
        mode: 'payment',
        success_url: `${domain}?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${domain}?canceled=true`,
        customer_email: email,
        metadata: {
          name,
          phone,
          guests,
          message
        }
      });
      
      res.json({ id: session.id, url: session.url });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // Confirm payment & send emails
  app.post("/api/confirm-payment", async (req, res) => {
    const { session_id } = req.body;
    
    if (!session_id || processedSessions.has(session_id)) {
      return res.json({ success: true, message: "Already processed or invalid." });
    }

    const stripe = getStripeClient();
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      
      if (session.payment_status === "paid") {
        processedSessions.add(session_id);
        
        const metadata = session.metadata || {};
        const { name, guests, phone, message } = metadata;
        const email = session.customer_email || metadata.email;

        const resendClient = getResendClient();
        if (resendClient) {
          const adminTargets = [
            process.env.ADMIN_EMAIL || "zorziriccardo20@gmail.com",
            "zorziriccardo06@gmail.com"
          ].filter((email, index, self) => email && self.indexOf(email) === index);
          
          const senderEmail = process.env.SENDER_EMAIL || "Villa Leopardi <onboarding@resend.dev>";
          
          // 1. Email to Admin (Villa Leopardi)
          const adminHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #fcfbfa; color: #1c1c1a; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #eae7e2; padding: 30px; border-radius: 4px; }
                .header { border-bottom: 2px solid #bdb1a1; padding-bottom: 20px; margin-bottom: 20px; }
                h2 { font-size: 18px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.15em; color: #bdb1a1; margin: 0; }
                .status-badge { display: inline-block; background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 15px; }
                .grid-table { margin: 20px 0; border: 1px solid #f3f0ec; border-radius: 3px; overflow: hidden; }
                .grid-row { display: flex; padding: 12px 16px; border-bottom: 1px solid #f3f0ec; }
                .grid-row:last-child { border-bottom: none; }
                .grid-label { width: 160px; text-transform: uppercase; font-size: 10px; font-weight: bold; letter-spacing: 0.1em; color: #8a8a80; }
                .grid-val { font-size: 13px; color: #1c1c1a; font-weight: 500; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="status-badge">PAGATO CON STRIPE</div>
                  <h2>CONFERMATA: Prenotazione Sunset Table</h2>
                </div>
                <p style="font-size: 13px; color: #5a5a54;">Un nuovo ospite ha prenotato e pagato con successo l'evento <strong>Sunset Table</strong> (Data: <strong>Sabato 27 Giugno 2026</strong>):</p>
                
                <div class="grid-table">
                  <div class="grid-row">
                    <div class="grid-label">Nome Ospite</div>
                    <div class="grid-val">${name}</div>
                  </div>
                  <div class="grid-row">
                    <div class="grid-label">Ospiti</div>
                    <div class="grid-val">${guests} persone</div>
                  </div>
                  <div class="grid-row">
                    <div class="grid-label">Smarphone</div>
                    <div class="grid-val">${phone || "Non fornito"}</div>
                  </div>
                  <div class="grid-row">
                    <div class="grid-label">Contatto E-mail</div>
                    <div class="grid-val">${email}</div>
                  </div>
                  <div class="grid-row">
                    <div class="grid-label">Taccuino Note</div>
                    <div class="grid-val">${message || "Nessun messaggio inserito"}</div>
                  </div>
                  <div class="grid-row">
                    <div class="grid-label">Quota Ricevuta</div>
                    <div class="grid-val" style="color: #15803d; font-weight: bold;">€ ${session.amount_total ? session.amount_total / 100 : 0},00</div>
                  </div>
                  <div class="grid-row">
                    <div class="grid-label">ID Transazione</div>
                    <div class="grid-val" style="font-size: 11px; font-family: monospace; color: #6b7280;">${session_id}</div>
                  </div>
                </div>
                
                <p style="font-size: 11px; color: #bdb1a1; margin-top: 25px;">Questa notifica è stata instradata in tempo reale in quanto il pagamento Stripe è stato completato e validato dal server di Villa Leopardi.</p>
              </div>
            </body>
            </html>
          `;

          for (const target of adminTargets) {
            await safeSendEmail(resendClient, {
               from: senderEmail,
               to: target,
               subject: `[CONFERMATA - PAGAMENTO RICEVUTO] Sunset Table per ${name}`,
               html: adminHtml,
            });
          }

          // 2. Email to the Client
          if (email) {
            const guestHtml = `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #fcfbfa; color: #1c1c1a; margin: 0; padding: 40px 20px; }
                  .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #eae7e2; padding: 40px; border-radius: 4px; }
                  .header { text-align: center; border-bottom: 1px solid #f3f0ec; padding-bottom: 30px; margin-bottom: 30px; }
                  .logo { font-size: 20px; font-weight: 300; letter-spacing: 0.2em; text-transform: uppercase; color: #1c1c1a; margin: 0; }
                  .logo-sub { font-size: 10px; font-weight: 400; letter-spacing: 0.3em; text-transform: uppercase; color: #bdb1a1; margin-top: 5px; }
                  h1 { font-size: 18px; font-weight: 400; letter-spacing: 0.05em; margin-bottom: 20px; text-align: center; color: #1c1c1a; text-transform: uppercase; }
                  p { font-size: 13.5px; line-height: 1.62; color: #5a5a54; margin-bottom: 20px; }
                  .details-box { background-color: #fdfdfc; border: 1px solid #f3f0ec; padding: 25px; border-radius: 3px; margin: 30px 0; }
                  .details-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f9f8f6; font-size: 12.5px; }
                  .details-row:last-child { border-bottom: none; }
                  .label { color: #8a8a80; text-transform: uppercase; font-size: 9px; letter-spacing: 0.1em; font-weight: bold; }
                  .value { font-weight: 500; color: #1c1c1a; }
                  .footer { text-align: center; font-size: 10px; color: #bdb1a1; border-top: 1px solid #f3f0ec; padding-top: 30px; margin-top: 30px; letter-spacing: 0.05em; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <div class="logo">Villa Leopardi</div>
                    <div class="logo-sub">Torri del Benaco</div>
                  </div>
                  <h1>Prenotazione confermata</h1>
                  <p>Gentile <strong>${name}</strong>,</p>
                  <p>Siamo lieti di informarLa che il Suo pagamento è andato a buon fine e che la Sua prenotazione per l'evento esclusivo <strong>Sunset Table</strong> presso Villa Leopardi è ufficialmente confermata.</p>
                  <p>Abbiamo riservato per Lei e i Suoi ospiti il nostro esclusivo tavolo con panorama mozzafiato a bordo piscina.</p>
                  
                  <div class="details-box">
                    <div class="details-row">
                      <span class="label">Evento</span>
                      <span class="value">Sunset Table Special Evening</span>
                    </div>
                    <div class="details-row">
                      <span class="label">Data Evento</span>
                      <span class="value" style="color: #bdb1a1; font-weight: bold;">Sabato, 27 Giugno 2026</span>
                    </div>
                    <div class="details-row">
                      <span class="label">Orario d'inizio</span>
                      <span class="value">Dalle ore 19:30</span>
                    </div>
                    <div class="details-row">
                      <span class="label">Ospite di riferimento</span>
                      <span class="value">${name}</span>
                    </div>
                    <div class="details-row">
                      <span class="label">Numero Ospiti</span>
                      <span class="value">${guests} persone</span>
                    </div>
                    <div class="details-row">
                      <span class="label">Stato Pagamento</span>
                      <span class="value" style="color: #15803d; font-weight: bold;">Ricevuto (Stripe Secure)</span>
                    </div>
                    <div class="details-row">
                      <span class="label">Importo Transato</span>
                      <span class="value">€ ${session.amount_total ? session.amount_total / 100 : 0},00</span>
                    </div>
                    <div class="details-row">
                      <span class="label">Note Speciali</span>
                      <span class="value">${message || "Nessuna richiesta speciale"}</span>
                    </div>
                  </div>
                  
                  <p>Siamo entusiasti di farLe vivere un'esperienza gastronomica unica avvolta dalle ultime luci del tramonto e dal DJ Set lounge esclusivo.</p>
                  <p>Per qualsiasi esigenza, informazione aggiuntiva o intolleranza alimentare, si senta libero di rispondere direttamente a questa e-mail.</p>
                  
                  <div class="footer">
                    VILLA LEOPARDI &copy; 2026 &mdash; VIA GARDESANA 21 30, TORRI DEL BENACO (VR), LAGO DI GARDA
                  </div>
                </div>
              </body>
              </html>
            `;
            await safeSendEmail(resendClient, {
              from: senderEmail,
              to: email,
              subject: "Conferma Prenotazione Dedicata - Villa Leopardi Sunset Table",
              html: guestHtml
            });
          }
        }
      }

      res.json({ success: true });
    } catch (e: any) {
      console.error("Error confirming payment:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // Legacy API Route for Booking
  app.post("/api/book", async (req, res) => {
    const { name, guests, phone, email, message } = req.body;

    const adminTargets = [
      process.env.ADMIN_EMAIL || "zorziriccardo20@gmail.com",
      "zorziriccardo06@gmail.com"
    ].filter((email, index, self) => email && self.indexOf(email) === index);
    
    // Resend's default free sandbox sender is "onboarding@resend.dev"
    const senderEmail = process.env.SENDER_EMAIL || "Villa Leopardi <onboarding@resend.dev>";

    console.log("--- NUOVA RICHIESTA DI PRENOTAZIONE ---");
    console.log(`Nome: ${name}, Ospiti: ${guests}, Email: ${email}`);

    // Get Resend API Client
    const resendClient = getResendClient();

    if (resendClient) {
      // 1. Email to the Admin (Hotel concierge)
      const adminSubject = `Nuova Richiesta Sunset Table: ${guests} Ospiti - ${name}`;
      const adminHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #fcfbfa; color: #1c1c1a; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #eae7e2; padding: 30px; border-radius: 4px; }
            .header { border-bottom: 1px solid #f3f0ec; padding-bottom: 20px; margin-bottom: 20px; }
            h2 { font-size: 18px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: #bdb1a1; margin: 0; }
            .grid-table { margin: 20px 0; border: 1px solid #f3f0ec; border-radius: 3px; overflow: hidden; }
            .grid-row { display: flex; padding: 12px 16px; border-bottom: 1px solid #f3f0ec; }
            .grid-row:last-child { border-bottom: none; }
            .grid-label { width: 150px; text-transform: uppercase; font-size: 10px; font-weight: bold; letter-spacing: 0.1em; color: #8a8a80; }
            .grid-val { font-size: 13px; color: #1c1c1a; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Nuova Prenotazione Ricevuta</h2>
            </div>
            <p style="font-size: 13px; color: #5a5a54;">Un nuovo ospite ha espresso interesse per l'evento <strong>Sunset Table</strong> presso Villa Leopardi:</p>
            
            <div class="grid-table">
              <div class="grid-row">
                <div class="grid-label">Nome Ospite</div>
                <div class="grid-val">${name}</div>
              </div>
              <div class="grid-row">
                <div class="grid-label">Ospiti</div>
                <div class="grid-val">${guests} persone</div>
              </div>
              <div class="grid-row">
                <div class="grid-label">Smarphone</div>
                <div class="grid-val">${phone}</div>
              </div>
              <div class="grid-row">
                <div class="grid-label">Contatto E-mail</div>
                <div class="grid-val">${email}</div>
              </div>
              <div class="grid-row">
                <div class="grid-label">Taccuino Note</div>
                <div class="grid-val">${message || "Nessun messaggio inserito"}</div>
              </div>
            </div>
            
            <p style="font-size: 11px; color: #bdb1a1; margin-top: 25px;">Questa e-mail è stata instradata in tempo reale tramite il portale integrato di Villa Leopardi.</p>
          </div>
        </body>
        </html>
      `;

      for (const target of adminTargets) {
        await safeSendEmail(resendClient, {
          from: senderEmail,
          to: target,
          subject: adminSubject,
          html: adminHtml,
        });
      }

      // 2. Beautiful Confirmation Email directly to the Guest (if they supplied one)
      if (email) {
        const guestSubject = "Villa Leopardi - Ricezione Richiesta Prenotazione Sunset Table";
        const guestHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #fcfbfa; color: #1c1c1a; margin: 0; padding: 40px 20px; }
              .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #eae7e2; padding: 40px; border-radius: 4px; }
              .header { text-align: center; border-bottom: 1px solid #f3f0ec; padding-bottom: 30px; margin-bottom: 30px; }
              .logo { font-size: 20px; font-weight: 300; letter-spacing: 0.2em; text-transform: uppercase; color: #1c1c1a; margin: 0; }
              .logo-sub { font-size: 10px; font-weight: 400; letter-spacing: 0.3em; text-transform: uppercase; color: #bdb1a1; margin-top: 5px; }
              h1 { font-size: 18px; font-weight: 400; letter-spacing: 0.05em; margin-bottom: 20px; text-align: center; color: #1c1c1a; text-transform: uppercase; }
              p { font-size: 13.5px; line-height: 1.62; color: #5a5a54; margin-bottom: 20px; }
              .details-box { background-color: #fdfdfc; border: 1px solid #f3f0ec; padding: 25px; border-radius: 3px; margin: 30px 0; }
              .details-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f9f8f6; font-size: 12.5px; }
              .details-row:last-child { border-bottom: none; }
              .label { color: #8a8a80; text-transform: uppercase; font-size: 9px; letter-spacing: 0.1em; font-weight: bold; }
              .value { font-weight: 500; color: #1c1c1a; }
              .footer { text-align: center; font-size: 10px; color: #bdb1a1; border-top: 1px solid #f3f0ec; padding-top: 30px; margin-top: 30px; letter-spacing: 0.05em; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">Villa Leopardi</div>
                <div class="logo-sub">Torri del Benaco</div>
              </div>
              <h1>Richiesta di prenotazione ricevuta</h1>
              <p>Gentile <strong>${name}</strong>,</p>
              <p>La ringraziamo per l'interesse dimostrato nei confronti di Villa Leopardi. Abbiamo registrato correttamente la Sua richiesta di prenotazione per l'evento <strong>Sunset Table</strong>.</p>
              <p>Il nostro Concierge Staff verificherà la disponibilità delle nostre postazioni panoramiche e si metterà in contatto con Lei a breve per confermare la prenotazione.</p>
              
              <div class="details-box">
                <div class="details-row">
                  <span class="label">Ospite</span>
                  <span class="value">${name}</span>
                </div>
                <div class="details-row">
                  <span class="label">Numero Ospiti</span>
                  <span class="value">${guests} persone</span>
                </div>
                <div class="details-row">
                  <span class="label">Telefono fornito</span>
                  <span class="value">${phone}</span>
                </div>
                <div class="details-row">
                  <span class="label">Recapito E-mail</span>
                  <span class="value">${email}</span>
                </div>
                <div class="details-row">
                  <span class="label">Note Particolari</span>
                  <span class="value">${message || "Nessuna richiesta speciale"}</span>
                </div>
              </div>
              
              <p>Restiamo a Sua completa disposizione per qualsiasi necessità o personalizzazione dell'evento.</p>
              
              <div class="footer">
                VILLA LEOPARDI &copy; 2026 &mdash; LAGO DI GARDA, ITALIA
              </div>
            </div>
          </body>
          </html>
        `;

        await safeSendEmail(resendClient, {
          from: senderEmail,
          to: email,
          subject: guestSubject,
          html: guestHtml,
        });
      }
    } else {
      console.warn("⚠️ Resend non configurato. Le email non sono state inviate.");
    }

    res.json({ success: true, message: "Richiesta ricevuta correttamente." });
  });

  // Define isProduction robustly - in production mode by default unless explicitly in development mode
  const isProduction = process.env.NODE_ENV !== "development";

  // Vite middleware for development
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    const publicPath = path.join(process.cwd(), "public");

    // Serve static assets with standard caching headers (1 day cache max-age)
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath, {
        maxAge: "1d",
        etag: true
      }));
    }

    // Serve public folder as fallback for raw static assets
    if (fs.existsSync(publicPath)) {
      app.use(express.static(publicPath, {
        maxAge: "1d",
        etag: true
      }));
    }

    // SPA fallback: ONLY serve index.html for non-asset routes (paths without extension)
    app.get("*", (req, res) => {
      const ext = path.extname(req.path);
      // If request has a file extension (like .png, .webp, .css, .js) but wasn't served by express.static, return 404.
      // This is crucial: returning index.html (200 OK) for missing images causes browsers to cache the HTML as an image,
      // resulting in broken image icons and slow image rendering.
      if (ext && ext !== ".html") {
        return res.status(404).send("Not Found");
      }

      const indexPath = fs.existsSync(distPath) 
        ? path.join(distPath, "index.html") 
        : path.join(process.cwd(), "index.html");
      res.sendFile(indexPath);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
