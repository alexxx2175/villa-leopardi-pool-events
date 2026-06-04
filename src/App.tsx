/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

function fnUrl(name: string) {
  return `${SUPABASE_URL}/functions/v1/${name}`;
}

function fnHeaders() {
  return {
    "Content-Type": "application/json",
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
  };
}
import { motion, AnimatePresence } from "motion/react";
import { Camera, Calendar, MapPin, Music, Sunset, Star, ChevronDown, Mail, Phone, Users, X, Globe, Lock } from "lucide-react";

const IMAGES = {
  hero: "/hero.png",
  aperitivo: "/gallery4.png",
  poolSide: "/gallery_topright.jpg",
  villa: "/gallery_bottomleft.jpg",
  party: "/gallery_bottomright.jpg",
  paese: "/gallery_topleft.jpg",
};

type Language = "IT" | "EN" | "DE";

function VillaLeopardiLogo({ isDarkBg = false, size = "normal" }: { isDarkBg?: boolean, size?: "normal" | "large" | "footer" }) {
  const textColor = isDarkBg ? "text-brand-primary animate-pulse-slow" : "text-brand-contrast";
  const starColor = isDarkBg ? "text-brand-primary fill-brand-primary" : "text-brand-contrast fill-brand-contrast";

  const labelSize = size === "large" 
    ? "text-[12px] md:text-[14px] tracking-[0.55em]" 
    : size === "footer"
    ? "text-[10px] tracking-[0.5em]"
    : "text-[9px] tracking-[0.45em]";
    
  const titleSize = size === "large" 
    ? "text-2xl md:text-3xl tracking-[0.35em] font-light" 
    : size === "footer"
    ? "text-base tracking-[0.3em] font-light"
    : "text-xs tracking-[0.25em] font-light";
    
  const starSize = size === "large" ? 12 : size === "footer" ? 8 : 7;
  const spacing = size === "large" ? "gap-1 mt-3" : "gap-0.5 mt-1.5";

  return (
    <div className={`flex flex-col items-center justify-center leading-none text-center select-none font-serif ${textColor}`}>
      <span className={`${labelSize} uppercase`}>VILLA</span>
      <span className={`${titleSize} uppercase mt-1`}>LEOPARDI</span>
      <div className={`flex ${spacing} justify-center items-center`}>
        {[1, 2, 3, 4].map((s) => (
          <Star key={s} size={starSize} className={`${starColor} stroke-none`} />
        ))}
        <span className="font-sans font-bold leading-none select-none ml-1" style={{ fontSize: `${starSize * 1.15}px` }}>S</span>
      </div>
    </div>
  );
}

function VLMonogram({ isDarkBg = false, size = "md" }: { isDarkBg?: boolean, size?: "sm" | "md" | "lg" }) {
  const textColor = isDarkBg ? "text-brand-primary border-brand-primary" : "text-brand-primary border-brand-primary/40";
  const containerClasses = size === "sm" 
    ? "w-8 h-8 text-[10px]" 
    : size === "lg" 
    ? "w-16 h-16 text-xl" 
    : "w-12 h-12 text-base";

  return (
    <div className={`border flex items-center justify-center font-serif leading-none select-none shrink-0 ${textColor} ${containerClasses}`}>
      <span className="relative -translate-x-[2px] -translate-y-[1px]">V</span>
      <span className="relative translate-x-[2px] translate-y-[2px] italic font-semibold">L</span>
    </div>
  );
}

const TRANSLATIONS = {
  IT: {
    nav: {
      about: "L'Evento",
      gallery: "Galleria",
      booking: "Prenota",
      reservations: "Prenotazioni"
    },
    hero: {
      subtitle: "Leopardi Signature Events",
      title1: "Sunset",
      title2: "Table",
      desc: "poolside experience",
    },
    about: {
      badge: "Sunset Table 2026",
      title: "Dove il gusto incontra",
      titleItalic: "la luce del tramonto.",
      desc1: "Villa Leopardi presenta una serata esclusiva pensata per accompagnare il calare del sole con eleganza e sapori di mare.",
      desc2: "Un'esperienza gastronomica d'autore avvolta dall'atmosfera magica dei nostri giardini, tra il riverbero della piscina a sfioro e le ultime luci del giorno.",
      menuTitle: "Menù della",
      menuSerata: "serata",
      menuItems: [
        "Selezione di crudo di pesce in abbinamento a calice di Champagne Pannier",
        "Risotto ai frutti di mare",
        "Dessert finale"
      ],
      experienceBadge: "4-Star Superior Experience"
    },
    features: [
      { label: "Lounge Music", desc: "DJ Set & Vibrazioni" },
      { label: "Tramonto", desc: "Poolside View" },
      { label: "Esclusivo", desc: "Max 50 Posti" },
      { label: "Data", desc: "27 Giugno 2026" },
    ],
    gallery: {
      badge: "Visual Moments",
      title: "La nostra cornice."
    },
    bookingSection: {
      title: "Unisciti a noi.",
      slots: [
        { label: "Orario", value: "dalle 18:30" },
        { label: "Musica", value: "Lounge music & DJ set" },
        { label: "Capacità", value: "Max 50 Posti" }
      ],
      note: "Posti limitati. Prenotazioni su villaleopardi.it per assicurarti un tavolo al tramonto.",
      btnPrimary: "Prenota Ora",
      btnSecondary: "WhatsApp Direct"
    },
    footer: {
      desc: "Affacciata sulle acque cristalline del Lago di Garda, la nostra villa 4 stelle superior a Torri del Benaco è il luogo ideale per un soggiorno all’insegna del relax e dell’eleganza.",
      contact: "Contatti",
      social: "Connect",
      facebook: "Pagina Facebook",
      instagram: "Pagina Instagram",
      copyright: "Copyright © 2025 Villa Leopardi."
    },
    modal: {
      badge: "Sunset Table 2026",
      title: "Richiesta",
      titleItalic: "Prenotazione",
      name: "Il tuo Nome",
      namePlaceholder: "Nome e Cognome...",
      guests: "Numero Persone",
      guestsPlaceholder: "Quanti sarete?",
      phone: "Telefono",
      email: "Email",
      message: "Messaggio o Domande",
      messagePlaceholder: "Scrivi qui eventuali richieste particolari...",
      submit: "Vai al Pagamento",
      submitting: "Apertura Checkout...",
      successTitle: "Richiesta Inviata!",
      successDesc: "Ti ricontatteremo a breve.",
      footerNote: "Verrai reindirizzato al pagamento sicuro.",
      totalPrice: "Totale (40€/pers):"
    }
  },
  EN: {
    nav: {
      about: "The Event",
      gallery: "Gallery",
      booking: "Book",
      reservations: "Reservations"
    },
    hero: {
      subtitle: "Leopardi Signature Events",
      title1: "Sunset",
      title2: "Table",
      desc: "poolside experience",
    },
    about: {
      badge: "Sunset Table 2026",
      title: "Where taste meets",
      titleItalic: "the sunset light.",
      desc1: "Villa Leopardi presents an exclusive evening designed to accompany the sunset with elegance and seafood flavors.",
      desc2: "A signature gastronomic experience wrapped in the magical atmosphere of our gardens, between the reflection of the infinity pool and the last lights of the day.",
      menuTitle: "Evening",
      menuSerata: "menu",
      menuItems: [
        "Selection of raw fish paired with a glass of Champagne Pannier",
        "Seafood risotto",
        "Final dessert"
      ],
      experienceBadge: "4-Star Superior Experience"
    },
    features: [
      { label: "Lounge Music", desc: "DJ Set & Vibrations" },
      { label: "Sunset", desc: "Poolside View" },
      { label: "Exclusive", desc: "Max 50 Guests" },
      { label: "Date", desc: "June 27th, 2026" },
    ],
    gallery: {
      badge: "Visual Moments",
      title: "Our Frame."
    },
    bookingSection: {
      title: "Join Us.",
      slots: [
        { label: "Time", value: "from 18:30" },
        { label: "Music", value: "Lounge music & DJ set" },
        { label: "Capacity", value: "Max 50 Guests" }
      ],
      note: "Limited slots. Book on villaleopardi.it to ensure a sunset table.",
      btnPrimary: "Book Now",
      btnSecondary: "WhatsApp Direct"
    },
    footer: {
      desc: "Overlooking the crystal-clear waters of Lake Garda, our 4-star superior villa in Torri del Benaco is the perfect place for a stay dedicated to relaxation and elegance.",
      contact: "Contacts",
      social: "Connect",
      facebook: "Facebook Page",
      instagram: "Instagram Page",
      copyright: "Copyright © 2025 Villa Leopardi."
    },
    modal: {
      badge: "Sunset Table 2026",
      title: "Booking",
      titleItalic: "Request",
      name: "Your Name",
      namePlaceholder: "Full Name...",
      guests: "Number of Guests",
      guestsPlaceholder: "How many guests?",
      phone: "Phone",
      email: "Email",
      message: "Message or Questions",
      messagePlaceholder: "Write any special requests here...",
      submit: "Proceed to Checkout",
      submitting: "Redirecting...",
      successTitle: "Request Sent!",
      successDesc: "We will contact you shortly.",
      footerNote: "You'll be redirected to secure payment.",
      totalPrice: "Total (40€/pers):"
    }
  },
  DE: {
    nav: {
      about: "Das Event",
      gallery: "Galerie",
      booking: "Buchen",
      reservations: "Reservierungen"
    },
    hero: {
      subtitle: "Leopardi Signature Events",
      title1: "Sunset",
      title2: "Table",
      desc: "poolside experience",
    },
    about: {
      badge: "Sunset Table 2026",
      title: "Wo Genuss auf",
      titleItalic: "das Licht des Sonnenuntergangs trifft.",
      desc1: "Villa Leopardi präsentiert einen exklusiven Abend, der den Sonnenuntergang mit Eleganz und Meeresaromen begleitet.",
      desc2: "Ein gastronomisches Erlebnis der Extraklasse, eingebettet in die magische Atmosphäre unserer Gärten, zwischen dem Spiegelbild des Infinity-Pools und dem letzten Licht des Tages.",
      menuTitle: "Menü",
      menuSerata: "des Abends",
      menuItems: [
        "Auswahl an rohem Fisch, serviert mit einem Glas Champagne Pannier",
        "Meeresfrüchte-Risotto",
        "Dessert zum Abschluss"
      ],
      experienceBadge: "4-Sterne Superior Erfahrung"
    },
    features: [
      { label: "Lounge Musik", desc: "DJ Set & Vibes" },
      { label: "Sonnenuntergang", desc: "Poolside View" },
      { label: "Exklusiv", desc: "Max. 50 Plätze" },
      { label: "Datum", desc: "27. Juni 2026" },
    ],
    gallery: {
      badge: "Visual Moments",
      title: "Unser Rahmen."
    },
    bookingSection: {
      title: "Seien Sie dabei.",
      slots: [
        { label: "Uhrzeit", value: "ab 18:30 Uhr" },
        { label: "Musik", value: "Lounge Musik & DJ Set" },
        { label: "Kapazität", value: "Max. 50 Plätze" }
      ],
      note: "Begrenzte Plätze. Buchen Sie auf villaleopardi.it, um sich einen Tisch bei Sonnenuntergang zu sichern.",
      btnPrimary: "Jetzt Buchen",
      btnSecondary: "WhatsApp Direct"
    },
    footer: {
      desc: "Mit Blick auf das kristallklare Wasser des Gardasees ist unsere 4-Sterne-Superior-Villa in Torri del Benaco der ideale Ort für einen Aufenthalt im Zeichen von Entspannung und Eleganz.",
      contact: "Kontakt",
      social: "Connect",
      facebook: "Facebook-Seite",
      instagram: "Instagram-Seite",
      copyright: "Copyright © 2025 Villa Leopardi."
    },
    modal: {
      badge: "Sunset Table 2026",
      title: "Reservierungs",
      titleItalic: "Anfrage",
      name: "Ihr Name",
      namePlaceholder: "Vor- und Nachname...",
      guests: "Anzahl Personen",
      guestsPlaceholder: "Wie viele Personen?",
      phone: "Telefon",
      email: "E-Mail",
      message: "Nachricht oder Fragen",
      messagePlaceholder: "Schreiben Sie hier Ihre Wünsche...",
      submit: "Zur Kasse",
      submitting: "Weiterleiten...",
      successTitle: "Anfrage Gesendet!",
      successDesc: "Wir werden uns in Kürze bei Ihnen melden.",
      footerNote: "Sie werden zur sicheren Zahlung weitergeleitet.",
      totalPrice: "Gesamt (40€/Pers):"
    }
  }
};

function App() {
  const [lang, setLang] = useState<Language>("IT");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  
  const T = TRANSLATIONS[lang];

  const [formData, setFormData] = useState({
    name: "",
    guests: "",
    phone: "",
    email: "",
    message: ""
  });

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const success = query.get("success");
    const sessionId = query.get("session_id");

    if (success) {
      setIsBookingOpen(true);
      setSubmitted(true);
      
      // Notify backend to confirm payment and send emails
      if (sessionId) {
        fetch(fnUrl("confirm-payment"), {
          method: "POST",
          headers: fnHeaders(),
          body: JSON.stringify({ session_id: sessionId }),
        }).catch(console.error);

        // Remove session_id from URL strictly for UI cleanliness
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      setTimeout(() => {
        setIsBookingOpen(false);
        setSubmitted(false);
      }, 5000);
    }
    if (query.get("canceled")) {
      alert("Il pagamento è stato annullato. / Payment canceled. / Zahlung abgebrochen.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch(fnUrl("create-checkout-session"), {
        method: "POST",
        headers: fnHeaders(),
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        console.warn("Stripe Checkout non disponibile. Fallback su prenotazione diretta.");
        const apiResponse = await fetch(fnUrl("book"), {
          method: "POST",
          headers: fnHeaders(),
          body: JSON.stringify(formData),
        });

        if (apiResponse.ok) {
          setSubmitted(true);
          setTimeout(() => {
            setIsBookingOpen(false);
            setSubmitted(false);
          }, 6000);
        } else {
          alert("Si è verificato un errore durante la prenotazione. Si prega di riprovare.");
        }
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Errore prenotazione, attivazione fallback diretto:", error);
      try {
        const apiResponse = await fetch(fnUrl("book"), {
          method: "POST",
          headers: fnHeaders(),
          body: JSON.stringify(formData),
        });

        if (apiResponse.ok) {
          setSubmitted(true);
          setTimeout(() => {
            setIsBookingOpen(false);
            setSubmitted(false);
          }, 6000);
        } else {
          alert("Impossibile contattare il server. Riprova più tardi.");
        }
      } catch {
        alert("Si è verificato un errore di rete.");
      }
      setIsSubmitting(false);
    }
  };
  
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const staggerContainer = {
    initial: {},
    whileInView: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen selection:bg-brand-primary selection:text-brand-neutral">
      {/* Global Fixed Background */}
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vh] h-[100vw] z-[-2] bg-cover bg-[center_40%] rotate-90 scale-105"
        style={{ backgroundImage: `url(${IMAGES.hero})` }}
      />
      <div className="fixed inset-0 bg-black/50 z-[-1]" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 md:px-6 py-4 bg-transparent">
        <a href="/" className="flex items-center">
          <img 
            src="/Logo.png"
            alt="Villa Leopardi" 
            className="h-8 md:h-12 w-auto object-contain transition-opacity duration-300 hover:opacity-85"
          />
        </a>
        <div className="hidden lg:flex gap-8 text-[11px] uppercase tracking-[0.2em] font-bold text-brand-primary drop-shadow-md">
          <a href="#about" className="hover:text-brand-accent transition-colors">{T.nav.about}</a>
          <a href="#gallery" className="hover:text-brand-accent transition-colors">{T.nav.gallery}</a>
          <a href="#booking" className="hover:text-brand-accent transition-colors">{T.nav.booking}</a>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          {/* Language Switcher */}
          <div className="relative z-50">
            <button 
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1 md:gap-1.5 px-2 py-1 md:px-3 md:py-1.5 text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-brand-primary drop-shadow-md border border-brand-primary/30 hover:bg-brand-primary/10 transition-all"
            >
              <Globe size={10} className="md:w-3 md:h-3 opacity-90" />
              {lang}
              <ChevronDown size={10} className={`transition-transform duration-300 ${isLangMenuOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {isLangMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 bg-brand-neutral border border-brand-accent/40 shadow-2xl overflow-hidden min-w-[120px]"
                >
                  {(["IT", "EN", "DE"] as Language[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLang(l); setIsLangMenuOpen(false); }}
                      className={`w-full px-6 py-3 text-[10px] uppercase tracking-widest text-left hover:bg-brand-primary/10 transition-colors ${lang === l ? "bg-brand-accent/35 font-bold text-brand-primary" : "text-brand-contrast/70"}`}
                    >
                      {l === "IT" ? "Italiano" : l === "EN" ? "English" : "Deutsch"}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setIsBookingOpen(true)}
            className="px-3 py-1 md:px-5 md:py-2 text-[8px] md:text-[10px] uppercase font-bold tracking-widest text-brand-primary drop-shadow-md border border-brand-primary/30 hover:bg-brand-primary hover:text-brand-contrast transition-all duration-300 whitespace-nowrap"
          >
            {T.nav.reservations}
          </button>
          <a
            href="/admin"
            className="flex items-center gap-1 px-2 py-1 md:px-3 md:py-1.5 text-[8px] md:text-[9px] uppercase font-bold tracking-widest text-brand-primary/60 drop-shadow-md hover:text-brand-primary transition-colors whitespace-nowrap"
          >
            <Lock size={9} className="opacity-70" />
            <span className="hidden md:inline">Admin</span>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[100dvh] flex items-center justify-center overflow-hidden">
        
        <div className="relative z-10 text-center text-brand-neutral px-4 mt-8 md:mt-0">
          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, letterSpacing: "1em" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="mb-4 md:mb-6"
          >
            <span className="text-[9px] md:text-sm uppercase font-light tracking-[1em] md:tracking-[2em] text-brand-primary ml-2">{T.hero.subtitle}</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center mb-6 md:mb-8"
          >
            <span className="text-6xl md:text-9xl font-serif font-light tracking-[0.1em] md:tracking-[0.18em] text-brand-primary uppercase leading-none md:leading-tight mb-2 select-none">{T.hero.title1}</span>
            <span className="text-6xl md:text-9xl font-serif font-light tracking-[0.1em] md:tracking-[0.18em] text-brand-primary uppercase leading-none md:leading-tight select-none">{T.hero.title2}</span>
            <div className="flex gap-1.5 justify-center items-center mt-6 md:mt-8 opacity-85 select-none">
              {[1, 2, 3, 4].map((s) => (
                <Star key={s} size={14} className="text-brand-primary fill-brand-primary stroke-none animate-pulse-slow" />
              ))}
              <span className="text-brand-primary font-sans font-bold text-sm tracking-normal ml-1 leading-none uppercase">S</span>
            </div>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col items-center gap-6 md:gap-10"
          >
            <p className="max-w-xl mx-auto text-base md:text-3xl font-signature opacity-90 leading-relaxed text-brand-primary italic lowercase">
              {T.hero.desc}
            </p>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="mt-10"
            >
              <ChevronDown className="opacity-50" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <main className="relative z-10 bg-brand-neutral">
      {/* About Section */}
      <section id="about" className="py-16 md:py-24 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <motion.div {...fadeInUp}>
            <span className="text-[10px] uppercase tracking-[0.3em] text-brand-primary font-bold mb-3 md:mb-4 block underline decoration-brand-accent underline-offset-4 md:underline-offset-8">{T.about.badge}</span>
            <h2 className="text-3xl md:text-5xl mb-6 md:mb-8 leading-tight">
              {T.about.title} <br /> 
              <span className="italic text-brand-primary">{T.about.titleItalic}</span>
            </h2>
            <div className="space-y-4 md:space-y-6 text-brand-contrast/70 leading-relaxed md:leading-loose text-sm md:text-lg font-light">
              <p>{T.about.desc1}</p>
              <p>{T.about.desc2}</p>
            </div>

            {/* Menu Section */}
            <div className="mt-10 md:mt-12 p-6 md:p-8 bg-brand-accent/20 border border-brand-accent/60">
              <h3 className="text-xs uppercase tracking-[0.3em] font-bold mb-6 text-brand-contrast">{T.about.menuTitle} <span className="font-signature normal-case tracking-normal text-xl">{T.about.menuSerata}</span>:</h3>
              <ul className="space-y-4 text-brand-contrast/80">
                {T.about.menuItems.map((item, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                    <p className="text-sm italic">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden border-[12px] border-brand-accent/40 shadow-2xl rotate-2">
              <img 
                src={IMAGES.aperitivo} 
                alt="Luxury Aperitivo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-brand-primary p-8 text-brand-contrast w-52 shadow-xl border border-brand-accent/30 hidden md:block -rotate-3">
              <div className="flex gap-0.5 items-center mb-4 select-none text-brand-contrast">
                {[1, 2, 3, 4].map((s) => (
                  <Star key={s} size={10} className="text-brand-contrast fill-brand-contrast stroke-none" />
                ))}
                <span className="font-sans font-bold text-[11px] ml-1 leading-none">S</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest font-bold leading-normal">{T.about.experienceBadge}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-20 bg-brand-contrast text-brand-neutral overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {T.features.map((item, i) => {
            const IconComponent = [Music, Sunset, Users, Calendar][i];
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                {IconComponent && (
                  <IconComponent 
                    className="mx-auto mb-6 text-brand-primary group-hover:scale-110 transition-transform duration-300" 
                    strokeWidth={1} 
                    size={32} 
                  />
                )}
                <h3 className="text-xs uppercase tracking-widest font-bold mb-2 text-brand-accent">{item.label}</h3>
                <p className="text-[10px] uppercase opacity-75 tracking-widest text-brand-neutral">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-16 md:py-24 bg-brand-neutral">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 gap-6">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-brand-primary font-bold mb-3 md:mb-4 block underline decoration-brand-accent underline-offset-4 md:underline-offset-8">{T.gallery.badge}</span>
              <h2 className="text-3xl md:text-5xl font-serif text-brand-contrast">{T.gallery.title}</h2>
            </div>
          </div>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6"
          >
            <motion.div variants={fadeInUp} className="md:col-span-8 h-[250px] md:h-[500px] overflow-hidden shadow-md border border-brand-accent/30">
              <img src={IMAGES.paese} alt="Lake Garda Village" className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" referrerPolicy="no-referrer" />
            </motion.div>
            <motion.div variants={fadeInUp} className="md:col-span-4 h-[250px] md:h-[500px] overflow-hidden shadow-md border border-brand-accent/30">
              <img src={IMAGES.poolSide} alt="Pool Side" className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" />
            </motion.div>
            <motion.div variants={fadeInUp} className="md:col-span-4 h-[250px] md:h-[500px] overflow-hidden shadow-md border border-brand-accent/30">
              <img src={IMAGES.villa} alt="Villa" className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" />
            </motion.div>
            <motion.div variants={fadeInUp} className="md:col-span-8 h-[250px] md:h-[500px] overflow-hidden shadow-md border border-brand-accent/30">
              <img src={IMAGES.party} alt="Night Atmosphere" className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Info & Booking Section */}
      <section id="booking" className="py-16 md:py-24 bg-brand-neutral border-y border-brand-accent/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 md:p-20 opacity-[0.03]">
          <span className="text-[150px] md:text-[300px] font-serif leading-none italic pointer-events-none text-brand-contrast">Villa</span>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center relative z-10">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl md:text-5xl font-serif text-brand-contrast mb-8 md:mb-12">{T.bookingSection.title}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12 px-0 md:px-4">
              {T.bookingSection.slots.map((slot, i) => {
                const IconComponent = [Calendar, MapPin, Star][i];
                return (
                  <div key={i} className="p-4 md:p-6 border border-brand-accent/60 bg-brand-neutral/40 hover:bg-brand-neutral/80 transition-all duration-300 shadow-sm">
                    {IconComponent && (
                      <IconComponent className="mx-auto mb-2 md:mb-3 text-brand-primary" size={18} />
                    )}
                    <h4 className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest mb-1 md:mb-2 text-brand-contrast opacity-80">{slot.label}</h4>
                    <p className="text-xs md:text-sm font-serif text-brand-contrast font-medium">{slot.value}</p>
                  </div>
                );
              })}
            </div>

            <p className="text-sm text-brand-contrast/70 mb-10 tracking-[0.1em] uppercase max-w-lg mx-auto font-light">
              {T.bookingSection.note}
            </p>

            <div className="flex justify-center items-center">
              <button 
                onClick={() => setIsBookingOpen(true)}
                className="bg-brand-contrast text-brand-neutral px-12 py-5 text-xs uppercase tracking-[0.3em] font-bold hover:bg-brand-primary hover:text-brand-contrast transition-all duration-500 shadow-xl w-full sm:w-auto"
              >
                {T.bookingSection.btnPrimary}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 md:py-20 px-4 md:px-6 bg-brand-contrast text-brand-neutral/80 border-t border-brand-accent/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          <div className="md:col-span-2">
            <div className="mb-6 md:mb-8 flex items-center gap-6">
              <VillaLeopardiLogo isDarkBg={true} size="footer" />
            </div>
            <p className="text-xs md:text-sm leading-relaxed md:leading-loose max-w-sm font-light opacity-60">
              {T.footer.desc}
            </p>
          </div>
          <div>
            <h5 className="text-[10px] uppercase tracking-widest font-bold text-brand-primary mb-4 md:mb-6">{T.footer.contact}</h5>
            <div className="space-y-4 text-xs font-light">
              <a href="tel:+390452457318" className="flex items-start md:items-center gap-3 hover:text-brand-primary transition-colors"><Phone size={14} className="shrink-0 mt-0.5 md:mt-0" /> +39 045 2457318</a>
              <a href="mailto:info@villaleopardi.it" className="flex items-start md:items-center gap-3 hover:text-brand-primary transition-colors"><Mail size={14} className="shrink-0 mt-0.5 md:mt-0" /> info@villaleopardi.it</a>
              <p className="flex items-start md:items-center gap-3 leading-relaxed"><MapPin size={14} className="shrink-0 mt-0.5 md:mt-0" /> Via Gardesana 21 30, Torri del Benaco, VR</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 md:mt-20 pt-8 border-t border-brand-neutral/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-widest opacity-40">
          <p className="text-center md:text-left">{T.footer.copyright}</p>
          <div className="flex flex-wrap justify-center md:justify-end gap-6 md:gap-8">
            <a href="#" className="hover:text-brand-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-primary transition-colors">Cookie Policy</a>
          </div>
        </div>
      </footer>
      </main>

      {/* Booking Modal */}
      <AnimatePresence>
        {isBookingOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBookingOpen(false)}
              className="absolute inset-0 bg-brand-contrast/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-brand-neutral w-full max-w-lg p-5 md:p-10 shadow-2xl border border-brand-accent/30 overflow-hidden max-h-[95vh] overflow-y-auto"
            >
              {/* Decoration */}
              <div className="absolute -top-12 -right-12 p-20 opacity-[0.03] text-brand-contrast">
                <span className="text-[120px] font-serif leading-none italic pointer-events-none">Villa</span>
              </div>

              <button 
                onClick={() => setIsBookingOpen(false)}
                className="absolute top-6 right-6 z-20 text-brand-contrast/40 hover:text-brand-primary transition-colors"
              >
                <X size={24} />
              </button>

              <div className="relative z-10">
                <span className="text-[10px] uppercase tracking-[0.3em] text-brand-primary font-bold mb-1 md:mb-2 block">{T.modal.badge}</span>
                <h2 className="text-2xl md:text-4xl font-serif text-brand-contrast mb-4 md:mb-8 tracking-tight">{T.modal.title} <span className="italic text-brand-primary">{T.modal.titleItalic}</span></h2>

                <form className="space-y-3 md:space-y-6" onSubmit={handleSubmit}>
                  {submitted ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-12 text-center"
                    >
                      <div className="w-16 h-16 bg-brand-primary/20 flex items-center justify-center mx-auto mb-6">
                        <Star className="text-brand-primary" size={32} />
                      </div>
                      <h3 className="text-2xl font-serif text-brand-contrast mb-2">{T.modal.successTitle}</h3>
                      <p className="text-sm opacity-60 text-brand-contrast">{T.modal.successDesc}</p>
                    </motion.div>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest font-bold opacity-60 block ml-1 text-brand-contrast">{T.modal.name}</label>
                        <input 
                          type="text" 
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={T.modal.namePlaceholder} 
                          className="w-full bg-brand-neutral border border-brand-accent/65 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-all text-brand-contrast"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 md:gap-6">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-widest font-bold opacity-60 block ml-1 text-brand-contrast">{T.modal.guests}</label>
                          <input 
                            type="number" 
                            required
                            min="1"
                            max="50"
                            value={formData.guests}
                            onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                            placeholder={T.modal.guestsPlaceholder} 
                            className="w-full bg-brand-neutral border border-brand-accent/65 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-all text-brand-contrast"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-widest font-bold opacity-60 block ml-1 text-brand-contrast">Telefono</label>
                          <input 
                            type="tel" 
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+39 000 0000000" 
                            className="w-full bg-brand-neutral border border-brand-accent/65 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-all text-brand-contrast"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest font-bold opacity-60 block ml-1 text-brand-contrast">Email</label>
                        <input 
                          type="email" 
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="la-tua@email.com" 
                          className="w-full bg-brand-neutral border border-brand-accent/65 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-all text-brand-contrast"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest font-bold opacity-60 block ml-1 text-brand-contrast">{T.modal.message}</label>
                        <textarea 
                          rows={2}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder={T.modal.messagePlaceholder} 
                          className="w-full bg-brand-neutral border border-brand-accent/65 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-all resize-none text-brand-contrast"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2 md:pt-4 pb-1 md:pb-2 border-t border-brand-accent/30">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-brand-contrast">
                          {T.modal.totalPrice}
                        </span>
                        <div className="text-xl md:text-2xl font-serif text-brand-contrast">
                          € {parseInt(formData.guests || "1") * 40},00
                        </div>
                      </div>

                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-brand-contrast text-brand-neutral py-3 md:py-5 text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold hover:bg-brand-primary hover:text-brand-contrast transition-all duration-500 mt-2 md:mt-4 shadow-lg shadow-brand-primary/10 disabled:opacity-50"
                      >
                        {isSubmitting ? T.modal.submitting : T.modal.submit}
                      </button>
                      
                      <p className="text-[9px] uppercase tracking-widest text-center opacity-45 leading-relaxed text-brand-contrast/80">
                        {T.modal.footerNote}
                      </p>
                    </>
                  )}
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Admin Dashboard ───────────────────────────────────────────────────────────

interface Booking {
  id: string;
  created_at: string;
  name: string;
  email: string | null;
  phone: string | null;
  guests: number;
  amount: number;
  stripe_session_id: string;
  notes: string | null;
}

function AdminDashboard() {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    sessionStorage.getItem("admin_token")
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error_description || data.msg || "Login fallito");
      sessionStorage.setItem("admin_token", data.access_token);
      setAccessToken(data.access_token);
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Errore di login");
    } finally {
      setLoggingIn(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_token");
    setAccessToken(null);
    setBookings([]);
  }

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    setFetchError(null);
    fetch(`${SUPABASE_URL}/rest/v1/bookings?order=created_at.desc`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${accessToken}`,
      },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBookings(data);
        else setFetchError(data.message || "Errore nel caricamento");
      })
      .catch(() => setFetchError("Errore di rete"))
      .finally(() => setLoading(false));
  }, [accessToken]);

  async function deleteBooking(id: string) {
    if (!accessToken) return;
    await fetch(`${SUPABASE_URL}/rest/v1/bookings?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${accessToken}`,
      },
    });
    setBookings((prev) => prev.filter((b) => b.id !== id));
  }

  const totalGuests = bookings.reduce((s, b) => s + b.guests, 0);
  const totalRevenue = bookings.reduce((s, b) => s + Number(b.amount), 0);

  if (!accessToken) {
    return (
      <div className="min-h-screen bg-[#f5f3f0] flex items-center justify-center px-4">
        <a href="/" className="absolute top-5 left-5 flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-[#8a8a80] hover:text-[#1c1c1a] transition-colors">
          <span>←</span> Home
        </a>
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <VillaLeopardiLogo size="normal" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#8a8a80] mt-4">Area Riservata</p>
          </div>
          <form onSubmit={handleLogin} className="bg-white border border-[#e5e0d8] p-8 space-y-5">
            <div>
              <label className="block text-[9px] uppercase tracking-[0.2em] text-[#8a8a80] mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#ddd8d0] bg-[#faf9f7] px-3 py-2.5 text-sm text-[#1c1c1a] focus:outline-none focus:border-[#bdb1a1]"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-[0.2em] text-[#8a8a80] mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#ddd8d0] bg-[#faf9f7] px-3 py-2.5 text-sm text-[#1c1c1a] focus:outline-none focus:border-[#bdb1a1]"
              />
            </div>
            {loginError && (
              <p className="text-red-600 text-xs">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full bg-[#1c1c1a] text-white py-3 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#bdb1a1] transition-colors disabled:opacity-50"
            >
              {loggingIn ? "Accesso..." : "Accedi"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f3f0]">
      <header className="bg-white border-b border-[#e5e0d8] px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-4 hover:opacity-70 transition-opacity">
          <VLMonogram size="sm" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#8a8a80]">Villa Leopardi</p>
            <p className="text-[11px] font-medium text-[#1c1c1a]">Dashboard Prenotazioni</p>
          </div>
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-[#8a8a80] hover:text-[#1c1c1a] transition-colors"
        >
          <Lock size={12} />
          Esci
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Prenotazioni", value: bookings.length },
            { label: "Ospiti Totali", value: totalGuests },
            { label: "Incasso", value: `€ ${totalRevenue.toFixed(0)}` },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-[#e5e0d8] p-5">
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#8a8a80] mb-1">{stat.label}</p>
              <p className="text-2xl font-serif text-[#1c1c1a]">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-[#e5e0d8]">
          <div className="px-6 py-4 border-b border-[#e5e0d8]">
            <h2 className="text-[10px] uppercase tracking-[0.25em] text-[#8a8a80]">
              Sunset Table — 27 Giugno 2026
            </h2>
          </div>

          {loading && (
            <p className="text-center py-12 text-[#8a8a80] text-sm">Caricamento...</p>
          )}
          {fetchError && (
            <p className="text-center py-12 text-red-500 text-sm">{fetchError}</p>
          )}
          {!loading && !fetchError && bookings.length === 0 && (
            <p className="text-center py-12 text-[#8a8a80] text-sm">Nessuna prenotazione ancora.</p>
          )}
          {!loading && bookings.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#f0ece6]">
                    {["Nome", "Email", "Telefono", "Ospiti", "Importo", "Note", "Data", ""].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[9px] uppercase tracking-[0.15em] text-[#8a8a80] font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, i) => (
                    <tr key={b.id} className={`border-b border-[#f8f6f3] ${i % 2 === 0 ? "" : "bg-[#faf9f7]"}`}>
                      <td className="px-4 py-3 font-medium text-[#1c1c1a]">{b.name}</td>
                      <td className="px-4 py-3 text-[#5a5a54] text-xs">{b.email || "—"}</td>
                      <td className="px-4 py-3 text-[#5a5a54] text-xs">{b.phone || "—"}</td>
                      <td className="px-4 py-3 text-center font-medium text-[#1c1c1a]">{b.guests}</td>
                      <td className="px-4 py-3 font-medium text-green-700">€ {Number(b.amount).toFixed(0)}</td>
                      <td className="px-4 py-3 text-[#8a8a80] text-xs max-w-[160px] truncate">{b.notes || "—"}</td>
                      <td className="px-4 py-3 text-[#8a8a80] text-xs whitespace-nowrap">
                        {new Date(b.created_at).toLocaleDateString("it-IT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => { if (window.confirm(`Eliminare la prenotazione di ${b.name}?`)) deleteBooking(b.id); }}
                          className="flex items-center gap-1 text-[9px] uppercase tracking-[0.1em] text-red-400 hover:text-red-600 transition-colors"
                        >
                          <X size={12} /> Elimina
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Root Router ───────────────────────────────────────────────────────────────

export default function Root() {
  const isAdmin = window.location.pathname === "/admin" || window.location.pathname === "/admin/";
  return isAdmin ? <AdminDashboard /> : <App />;
}
