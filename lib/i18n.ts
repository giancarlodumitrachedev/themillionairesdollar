/**
 * Lightweight i18n. Two locales only: Italian (default for IT visitors) and
 * English (everyone else). No external dependency — a frozen dictionary.
 */

export type Locale = "it" | "en";

export const LOCALES: Locale[] = ["it", "en"];
export const DEFAULT_LOCALE: Locale = "en";

export interface FaqItem {
  q: string;
  a: string;
}

export interface Dictionary {
  nav: {
    wall: string;
    map: string;
    manifesto: string;
    press: string;
    participate: string;
    menu: string;
    close: string;
  };
  hero: {
    label: string;
    sublinePrimary: string;
    sublineSecondary: string;
    scroll: string;
  };
  question: {
    title: string;
    paragraphs: string[];
  };
  wall: {
    eyebrow: string;
    title: string;
    subtitle: string;
    viewAll: (n: string) => string;
  };
  map: {
    eyebrow: string;
    title: string;
    subtitle: string;
    declarations: string;
    legend: string;
    explore: string;
    onePerson: string;
  };
  tiers: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cta: string;
    permanentNote: string;
  };
  curators: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    readManifesto: string;
  };
  press: {
    eyebrow: string;
    title: string;
  };
  faq: {
    title: string;
    items: FaqItem[];
  };
  footer: {
    tagline: string;
    byline: string;
    explore: string;
    legal: string;
    newsletterHeading: string;
    newsletterPlaceholder: string;
    subscribe: string;
    newsletterMicrocopy: string;
    copyright: string;
    privacy: string;
    terms: string;
    contact: string;
  };
  common: {
    addYourself: string;
    loading: string;
    backToWall: string;
    joinedOn: (date: string) => string;
  };
}

const en: Dictionary = {
  nav: {
    wall: "Wall",
    map: "Map",
    manifesto: "Manifesto",
    press: "Press",
    participate: "Add yourself",
    menu: "Menu",
    close: "Close",
  },
  hero: {
    label: "Millionaires exist",
    sublinePrimary: "They proved it with €5",
    sublineSecondary: "You are invited to do the same",
    scroll: "Scroll",
  },
  question: {
    title: "Why would anyone pay €5 to say they exist?",
    paragraphs: [
      "Existence is usually assumed, never declared. We are surrounded by proof of things — receipts, deeds, contracts — and almost none of it says, simply, that a person was here.",
      "This is a wall of people who decided to say it anyway. Each tile is a small, deliberate act: a name, a place, a year, one line. Nothing is sold back to you. Nothing is promised except permanence.",
      "Five euros is enough to be absurd and not enough to be a transaction. That is the point. What remains is the gesture itself — and the company of everyone else who made it.",
    ],
  },
  wall: {
    eyebrow: "01 — The Wall",
    title: "Every tile is a person",
    subtitle: "Click any to read their reason for existing",
    viewAll: (n) => `View all ${n} tiles →`,
  },
  map: {
    eyebrow: "02 — The Map",
    title: "Where existence has been declared",
    subtitle: "Real-time visualization of every participant",
    declarations: "Declarations",
    legend: "= one person",
    explore: "Explore full map →",
    onePerson: "one person",
  },
  tiers: {
    eyebrow: "03 — Participate",
    title: "Choose how you want to exist",
    subtitle: "Every participation is permanent",
    cta: "Add yourself",
    permanentNote: "Every participation is permanent",
  },
  curators: {
    eyebrow: "04 — The Curators",
    title: "We won't tell you who we are. Not yet.",
    paragraphs: [
      "We are a small group, and we prefer to remain a question for now. What we can say is that we built this wall to find out something simple: how many people will raise their hand, not for a reward, but to be counted.",
      "We are not a brand. We are not raising a round. We are keeping a record. The record belongs to everyone on it.",
      "There will be more, later. We won't describe it here, because describing it would change it. If you are the kind of person who joins a thing before it explains itself, you already understand.",
      "For now, the wall is the whole story. Read it as a list of people who decided to exist out loud.",
    ],
    readManifesto: "Read the full manifesto →",
  },
  press: {
    eyebrow: "05 — Coverage",
    title: "As covered in",
  },
  faq: {
    title: "Questions",
    items: [
      {
        q: "Do I have to be a millionaire?",
        a: "No. The wall runs on an honour system. The invitation is addressed to millionaires, but anyone who wants to declare they exist is welcome to add themselves.",
      },
      {
        q: "Is this a donation, an investment, or a purchase?",
        a: "None of those, exactly. You pay to place a permanent tile on a public wall. There is no financial return, no equity, and no product shipped to you. What you receive is the tile and its permanence.",
      },
      {
        q: "What happens to my money?",
        a: "It funds the project — the infrastructure that keeps the wall and the map alive, and the work behind what comes next. Contributions are not refundable, except where a tier explicitly says otherwise.",
      },
      {
        q: "What do you do with my data?",
        a: "Only what you consent to. Your tile shows what you choose to show. We never sell data. You can request removal at any time; the tile comes down, though contributions are not refunded.",
      },
      {
        q: "Can I stay anonymous?",
        a: "Yes. Choose “initials only” and your full name is never shown publicly. Your location is shown only at city level, with a random offset, never your exact position.",
      },
      {
        q: "What are the higher tiers for?",
        a: "They are for people who want their participation to carry more weight — a highlighted position, verification, or a place in what we are preparing. The higher tiers unlock as the project grows.",
      },
    ],
  },
  footer: {
    tagline: "The Millionaire's Dollar",
    byline: "A project by The Curators",
    explore: "Explore",
    legal: "Legal",
    newsletterHeading: "Stay informed",
    newsletterPlaceholder: "Your email",
    subscribe: "Subscribe",
    newsletterMicrocopy: "No spam. Occasional updates only.",
    copyright: "© MMXXVI The Curators",
    privacy: "Privacy",
    terms: "Terms",
    contact: "Contact",
  },
  common: {
    addYourself: "Add yourself",
    loading: "Loading",
    backToWall: "Back to the Wall",
    joinedOn: (date) => `Joined the Wall on ${date}`,
  },
};

const it: Dictionary = {
  nav: {
    wall: "Muro",
    map: "Mappa",
    manifesto: "Manifesto",
    press: "Stampa",
    participate: "Aggiungiti",
    menu: "Menu",
    close: "Chiudi",
  },
  hero: {
    label: "I milionari esistono",
    sublinePrimary: "Lo hanno dimostrato con €5",
    sublineSecondary: "Sei invitato a fare lo stesso",
    scroll: "Scorri",
  },
  question: {
    title: "Perché qualcuno pagherebbe €5 per dire di esistere?",
    paragraphs: [
      "L'esistenza di solito si dà per scontata, non si dichiara. Siamo circondati da prove di cose — ricevute, atti, contratti — e quasi nessuna dice, semplicemente, che una persona è stata qui.",
      "Questo è un muro di persone che hanno deciso di dirlo lo stesso. Ogni tessera è un piccolo gesto deliberato: un nome, un luogo, un anno, una riga. Non ti viene rivenduto nulla. Non si promette nulla tranne la permanenza.",
      "Cinque euro bastano per essere assurdi e non bastano per essere una transazione. È questo il punto. Ciò che resta è il gesto stesso — e la compagnia di tutti gli altri che lo hanno fatto.",
    ],
  },
  wall: {
    eyebrow: "01 — Il Muro",
    title: "Ogni tessera è una persona",
    subtitle: "Clicca su una qualsiasi per leggere la sua ragione di esistere",
    viewAll: (n) => `Vedi tutte le ${n} tessere →`,
  },
  map: {
    eyebrow: "02 — La Mappa",
    title: "Dove l'esistenza è stata dichiarata",
    subtitle: "Visualizzazione in tempo reale di ogni partecipante",
    declarations: "Dichiarazioni",
    legend: "= una persona",
    explore: "Esplora la mappa completa →",
    onePerson: "una persona",
  },
  tiers: {
    eyebrow: "03 — Partecipa",
    title: "Scegli come vuoi esistere",
    subtitle: "Ogni partecipazione è permanente",
    cta: "Aggiungiti",
    permanentNote: "Ogni partecipazione è permanente",
  },
  curators: {
    eyebrow: "04 — I Curatori",
    title: "Non ti diremo chi siamo. Non ancora.",
    paragraphs: [
      "Siamo un piccolo gruppo, e per ora preferiamo restare una domanda. Quello che possiamo dire è che abbiamo costruito questo muro per scoprire una cosa semplice: quante persone alzeranno la mano, non per un premio, ma per essere contate.",
      "Non siamo un brand. Non stiamo raccogliendo un round. Stiamo tenendo un registro. Il registro appartiene a tutti coloro che vi figurano.",
      "Ci sarà altro, più avanti. Non lo descriveremo qui, perché descriverlo lo cambierebbe. Se sei il tipo di persona che si unisce a una cosa prima che si spieghi, hai già capito.",
      "Per ora, il muro è tutta la storia. Leggilo come un elenco di persone che hanno deciso di esistere ad alta voce.",
    ],
    readManifesto: "Leggi il manifesto completo →",
  },
  press: {
    eyebrow: "05 — Stampa",
    title: "Come riportato da",
  },
  faq: {
    title: "Domande",
    items: [
      {
        q: "Devo essere un milionario?",
        a: "No. Il muro funziona a fiducia. L'invito è rivolto ai milionari, ma chiunque voglia dichiarare di esistere è il benvenuto.",
      },
      {
        q: "È una donazione, un investimento o un acquisto?",
        a: "Nessuno di questi, esattamente. Paghi per collocare una tessera permanente su un muro pubblico. Non c'è ritorno economico, né quote, né un prodotto spedito. Ciò che ricevi è la tessera e la sua permanenza.",
      },
      {
        q: "Cosa succede ai miei soldi?",
        a: "Finanziano il progetto — l'infrastruttura che tiene in vita il muro e la mappa, e il lavoro dietro ciò che verrà. I contributi non sono rimborsabili, salvo dove un tier dice esplicitamente il contrario.",
      },
      {
        q: "Cosa fate con i miei dati?",
        a: "Solo ciò che acconsenti. La tua tessera mostra ciò che scegli di mostrare. Non vendiamo mai i dati. Puoi richiedere la rimozione in qualsiasi momento; la tessera viene tolta, ma i contributi non sono rimborsati.",
      },
      {
        q: "Posso restare anonimo?",
        a: "Sì. Scegli “solo iniziali” e il tuo nome completo non sarà mai mostrato pubblicamente. La tua posizione è mostrata solo a livello di città, con uno scostamento casuale, mai la tua posizione esatta.",
      },
      {
        q: "A cosa servono i tier più alti?",
        a: "Sono per chi vuole che la propria partecipazione abbia più peso — una posizione in evidenza, la verifica, o un posto in ciò che stiamo preparando. I tier più alti si sbloccano man mano che il progetto cresce.",
      },
    ],
  },
  footer: {
    tagline: "The Millionaire's Dollar",
    byline: "Un progetto de I Curatori",
    explore: "Esplora",
    legal: "Legale",
    newsletterHeading: "Resta aggiornato",
    newsletterPlaceholder: "La tua email",
    subscribe: "Iscriviti",
    newsletterMicrocopy: "Niente spam. Solo aggiornamenti occasionali.",
    copyright: "© MMXXVI I Curatori",
    privacy: "Privacy",
    terms: "Termini",
    contact: "Contatti",
  },
  common: {
    addYourself: "Aggiungiti",
    loading: "Caricamento",
    backToWall: "Torna al Muro",
    joinedOn: (date) => `Aggiunto al Muro il ${date}`,
  },
};

export const dictionaries: Record<Locale, Dictionary> = { it, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function isLocale(value: string): value is Locale {
  return value === "it" || value === "en";
}

/** Resolve a locale from an Accept-Language header. Italian only for `it*`. */
export function localeFromAcceptLanguage(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;
  const first = header.split(",")[0]?.trim().toLowerCase() ?? "";
  return first.startsWith("it") ? "it" : "en";
}
