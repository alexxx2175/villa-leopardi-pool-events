import { Resend } from 'npm:resend@3'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, guests, phone, email, message } = await req.json()

    const resendKey = Deno.env.get('RESEND_API_KEY')
    const senderEmail = Deno.env.get('SENDER_EMAIL') ?? 'Villa Leopardi <onboarding@resend.dev>'
    const adminEmail = Deno.env.get('ADMIN_EMAIL') ?? 'zorziriccardo20@gmail.com'

    const adminTargets = [adminEmail, 'zorziriccardo06@gmail.com'].filter(
      (e, i, arr) => e && arr.indexOf(e) === i
    )

    console.log(`[book] Nuova prenotazione: ${name}, ${guests} ospiti, ${email}`)

    if (resendKey) {
      const resend = new Resend(resendKey)

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
            <div class="header"><h2>Nuova Prenotazione Ricevuta</h2></div>
            <p style="font-size:13px;color:#5a5a54;">Un nuovo ospite ha espresso interesse per l'evento <strong>Sunset Table</strong>:</p>
            <div class="grid-table">
              <div class="grid-row"><div class="grid-label">Nome</div><div class="grid-val">${name}</div></div>
              <div class="grid-row"><div class="grid-label">Ospiti</div><div class="grid-val">${guests} persone</div></div>
              <div class="grid-row"><div class="grid-label">Telefono</div><div class="grid-val">${phone}</div></div>
              <div class="grid-row"><div class="grid-label">Email</div><div class="grid-val">${email}</div></div>
              <div class="grid-row"><div class="grid-label">Note</div><div class="grid-val">${message || 'Nessun messaggio'}</div></div>
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
            <h1>Richiesta di prenotazione ricevuta</h1>
            <p>Gentile <strong>${name}</strong>,</p>
            <p>Abbiamo registrato la Sua richiesta per l'evento <strong>Sunset Table</strong>. Il nostro staff si metterà in contatto con Lei a breve per confermare la prenotazione.</p>
            <div class="details-box">
              <div class="details-row"><span class="label">Ospite</span><span class="value">${name}</span></div>
              <div class="details-row"><span class="label">Numero Ospiti</span><span class="value">${guests} persone</span></div>
              <div class="details-row"><span class="label">Telefono</span><span class="value">${phone}</span></div>
              <div class="details-row"><span class="label">Email</span><span class="value">${email}</span></div>
              <div class="details-row"><span class="label">Note</span><span class="value">${message || 'Nessuna richiesta speciale'}</span></div>
            </div>
            <div class="footer">VILLA LEOPARDI &copy; 2026 &mdash; LAGO DI GARDA, ITALIA</div>
          </div>
        </body>
        </html>
      `

      for (const target of adminTargets) {
        await resend.emails.send({
          from: senderEmail,
          to: target,
          subject: `Nuova Richiesta Sunset Table: ${guests} Ospiti - ${name}`,
          html: adminHtml,
        })
      }

      if (email) {
        await resend.emails.send({
          from: senderEmail,
          to: email,
          subject: 'Villa Leopardi - Ricezione Richiesta Prenotazione Sunset Table',
          html: guestHtml,
        })
      }
    } else {
      console.warn('RESEND_API_KEY non configurato. Email non inviate.')
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
