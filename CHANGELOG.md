# Storico modifiche — Villa Leopardi · Sunset Table

Le modifiche più recenti sono in cima. Ogni voce indica **cosa**, **perché** e **come** è stata fatta.

---

## 2026-06-26

### 🟢 Vendite riaperte
- **Cosa:** rimosso lo stato "Sold Out". I pulsanti di prenotazione/acquisto (navbar + sezione prenotazioni) sono di nuovo attivi e il flusso di pagamento Stripe è riattivato.
- **Come:** flag `SOLD_OUT` riportato da `true` a `false` in cima a `src/App.tsx`.
- **Per richiudere le vendite:** rimettere `SOLD_OUT = true`, poi commit + push.

---

## 2026-06-25

### 🔴 Evento "Sold Out"
- **Cosa:** tutti i posti per la serata del **27 giugno 2026** sono esauriti. I pulsanti di acquisto/prenotazione sono stati sostituiti da uno stato **Sold Out** (badge nella navbar + riquadro nella sezione prenotazioni, con nota in IT/EN/DE).
- **Dove:** `src/App.tsx`.
- **Come riaprire le vendite:** in cima a `src/App.tsx` cambiare `const SOLD_OUT = true;` → `false`, poi commit + push. Torna tutto attivo, niente da riscrivere.
- Commit: `e0d4894`.

### 🔒 Sicurezza — accesso ai dati clienti ristretto (RLS)
- **Problema:** la tabella `bookings` (Supabase) permetteva a **qualsiasi utente autenticato** di leggere e cancellare TUTTE le prenotazioni (policy `USING (true)`). Combinato con la registrazione pubblica aperta, chiunque avrebbe potuto registrarsi e leggere nome/email/telefono dei clienti (dato segnalato anche dall'advisor ufficiale Supabase).
- **Soluzione:** lettura e cancellazione ora consentite solo agli admin tramite la funzione `public.is_admin()`, con allowlist:
  - `info@villaleopardi.it`
  - `info@ctmarketing.it`
- **Dove:** migration `supabase/migrations/20260625000000_restrict_bookings_to_admins.sql` (già applicata al progetto live `cuikykovkrifgdgznrgw`).
- **Per aggiungere un admin in futuro:** aggiungere l'email dentro la funzione `is_admin()` (un solo punto da modificare).
- Commit: `93a1cad`.

### 🧹 Pulizia — rimozione codice morto
- **Cosa:** rimossi file inutilizzati ereditati dallo scaffolding iniziale (AI Studio), che non venivano importati da nessuna parte e impedivano al typecheck di passare pulito:
  - `server.ts` (server Express alternativo, mai usato)
  - `src/lib/firebase.ts`, `src/services/gmail.ts` (integrazione Firebase/Gmail mai utilizzata)
  - `firebase-applet-config.json` (config Firebase orfana)
  - `scripts/gemini_read_pdf.js` (script Gemini residuo)
- **Effetto:** `npm run lint` (`tsc --noEmit`) ora passa pulito; meno superficie d'attacco e meno confusione.
- Commit: `93a1cad`.

### 🚀 Deploy
- Push su GitHub `main` → deploy automatico su Vercel (git-integration attiva).
- Live su **https://serate.villaleopardi.it** — verificato end-to-end (lo stato "Sold Out" è presente nel bundle in produzione).

### ⏳ Da completare (azioni manuali nel Dashboard Supabase — consigliate, non bloccanti)
Non modificabili da codice → [Authentication providers](https://supabase.com/dashboard/project/cuikykovkrifgdgznrgw/auth/providers):
1. **Disattivare la registrazione pubblica** ("Allow new users to sign up" OFF) — difesa aggiuntiva contro account non autorizzati.
2. **Abilitare "Leaked Password Protection"** — unico advisor di sicurezza ancora aperto.

### 📋 Altri punti emersi dall'audit (non ancora affrontati)
- **Webhook Stripe**: il salvataggio della prenotazione dipende dal ritorno del browser dopo il pagamento; se il cliente chiude la scheda dopo aver pagato, la prenotazione non viene salvata. Soluzione consigliata: webhook `checkout.session.completed` con verifica firma.
- **Edge Functions** (`book`, `confirm-payment`): mancano validazione input, escaping HTML nelle email e rate-limiting (rischio spam/abuso).
- **Email hardcoded** nelle Edge Functions (`zorziriccardo20@gmail.com`, `zorziriccardo06@gmail.com`) → spostare in variabili d'ambiente.
- `README.md` è ancora il template AI Studio (cita `GEMINI_API_KEY`, non usato).
