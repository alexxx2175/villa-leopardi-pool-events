import Stripe from 'npm:stripe@14'
import { Resend } from 'npm:resend@3'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { session_id } = await req.json()

    if (!session_id) {
      return new Response(JSON.stringify({ success: true, message: 'session_id mancante.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: 'Stripe non configurato.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })
    const session = await stripe.checkout.sessions.retrieve(session_id)

    if (session.payment_status !== 'paid') {
      return new Response(JSON.stringify({ success: false, message: 'Pagamento non completato.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const metadata = session.metadata ?? {}
    const { name, guests, phone, message } = metadata
    const email = session.customer_email ?? metadata.email
    const amountTotal = session.amount_total ? session.amount_total / 100 : 0

    const resendKey = Deno.env.get('RESEND_API_KEY')
    const senderEmail = Deno.env.get('SENDER_EMAIL') ?? 'Villa Leopardi <onboarding@resend.dev>'
    const adminEmail = Deno.env.get('ADMIN_EMAIL') ?? 'zorziriccardo20@gmail.com'

    const adminTargets = [adminEmail, 'zorziriccardo06@gmail.com'].filter(
      (e, i, arr) => e && arr.indexOf(e) === i
    )

    if (resendKey) {
      const resend = new Resend(resendKey)

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
            <p style="font-size:13px;color:#5a5a54;">Nuovo ospite confermato per <strong>Sunset Table</strong> (27 Giugno 2026):</p>
            <div class="grid-table">
              <div class="grid-row"><div class="grid-label">Nome Ospite</div><div class="grid-val">${name}</div></div>
              <div class="grid-row"><div class="grid-label">Ospiti</div><div class="grid-val">${guests} persone</div></div>
              <div class="grid-row"><div class="grid-label">Telefono</div><div class="grid-val">${phone ?? 'Non fornito'}</div></div>
              <div class="grid-row"><div class="grid-label">Email</div><div class="grid-val">${email}</div></div>
              <div class="grid-row"><div class="grid-label">Note</div><div class="grid-val">${message ?? 'Nessun messaggio'}</div></div>
              <div class="grid-row"><div class="grid-label">Quota Ricevuta</div><div class="grid-val" style="color:#15803d;font-weight:bold;">€ ${amountTotal},00</div></div>
              <div class="grid-row"><div class="grid-label">ID Transazione</div><div class="grid-val" style="font-size:11px;font-family:monospace;color:#6b7280;">${session_id}</div></div>
            </div>
          </div>
        </body>
        </html>
      `

      const guestHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #fcfbfa; color: #1c1c1a; margin: 0; padding: 40px 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #eae7e2; padding: 40px; border-radius: 4px; }
            .header { text-align: center; border-bottom: 1px solid #f3f0ec; padding-bottom: 30px; margin-bottom: 30px; }
            .logo { font-size: 20px; font-weight: 300; letter-spacing: 0.2em; text-transform: uppercase; color: #1c1c1a; }
            .logo-sub { font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: #bdb1a1; margin-top: 5px; }
            h1 { font-size: 18px; font-weight: 400; letter-spacing: 0.05em; text-align: center; color: #1c1c1a; text-transform: uppercase; }
            p { font-size: 13.5px; line-height: 1.62; color: #5a5a54; }
            .details-box { background: #fdfdfc; border: 1px solid #f3f0ec; padding: 25px; border-radius: 3px; margin: 30px 0; }
            .details-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f9f8f6; font-size: 12.5px; }
            .details-row:last-child { border-bottom: none; }
            .label { color: #8a8a80; text-transform: uppercase; font-size: 9px; letter-spacing: 0.1em; font-weight: bold; }
            .value { font-weight: 500; color: #1c1c1a; }
            .footer { text-align: center; font-size: 10px; color: #bdb1a1; border-top: 1px solid #f3f0ec; padding-top: 30px; margin-top: 30px; }
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
            <p>Il Suo pagamento è andato a buon fine. La prenotazione per l'evento <strong>Sunset Table</strong> presso Villa Leopardi è ufficialmente confermata.</p>
            <div class="details-box">
              <div class="details-row"><span class="label">Evento</span><span class="value">Sunset Table Special Evening</span></div>
              <div class="details-row"><span class="label">Data</span><span class="value" style="color:#bdb1a1;font-weight:bold;">Sabato, 27 Giugno 2026</span></div>
              <div class="details-row"><span class="label">Orario</span><span class="value">Dalle ore 18:30</span></div>
              <div class="details-row"><span class="label">Ospite</span><span class="value">${name}</span></div>
              <div class="details-row"><span class="label">Numero Ospiti</span><span class="value">${guests} persone</span></div>
              <div class="details-row"><span class="label">Pagamento</span><span class="value" style="color:#15803d;font-weight:bold;">Ricevuto (Stripe Secure)</span></div>
              <div class="details-row"><span class="label">Importo</span><span class="value">€ ${amountTotal},00</span></div>
              <div class="details-row"><span class="label">Note</span><span class="value">${message ?? 'Nessuna richiesta speciale'}</span></div>
            </div>
            <p>Per qualsiasi esigenza, risponda direttamente a questa e-mail.</p>
            <div class="footer">VILLA LEOPARDI &copy; 2026 &mdash; VIA GARDESANA 21 30, TORRI DEL BENACO (VR)</div>
          </div>
        </body>
        </html>
      `

      for (const target of adminTargets) {
        await resend.emails.send({
          from: senderEmail,
          to: target,
          subject: `[CONFERMATA - PAGAMENTO RICEVUTO] Sunset Table per ${name}`,
          html: adminHtml,
        })
      }

      if (email) {
        await resend.emails.send({
          from: senderEmail,
          to: email,
          subject: 'Conferma Prenotazione - Villa Leopardi Sunset Table',
          html: guestHtml,
        })
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
