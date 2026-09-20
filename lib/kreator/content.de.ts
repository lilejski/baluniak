/**
 * German Kreator copy — services, the scripted questions and the interface.
 *
 * Kept beside content.ts rather than inside it: with three languages that file
 * would be 1200 lines of prose. Same writing rules as the Polish and English
 * versions, plus one more: German addresses the visitor as "Sie", always.
 */

import type { KreatorQuestion, Service, ServiceId } from "./types";

export const SERVICES_DE: Service[] = [
  {
    id: "website",
    label: "Website",
    blurb: "Firmenauftritt, Seite mit dem Angebot oder eine Seite für Anzeigen.",
    icon: "Globe",
  },
  {
    id: "shop",
    label: "Onlineshop",
    blurb: "Verkauf im Internet, Zahlungen, Versand.",
    icon: "ShoppingBag",
  },
  {
    id: "app",
    label: "Anwendung oder System",
    blurb: "Maßgeschneidertes Werkzeug: Verwaltung, Datenbank, Auftragsabwicklung.",
    icon: "LayoutDashboard",
  },
  {
    id: "ai",
    label: "Künstliche Intelligenz im Unternehmen",
    blurb: "Chatbot für Kundschaft, automatische Texte, Produktfotos.",
    icon: "Sparkles",
  },
  {
    id: "automation",
    label: "Automatisierung der Arbeit",
    blurb: "Der Computer übernimmt, was heute von Hand geklickt wird.",
    icon: "Workflow",
  },
  {
    id: "audit",
    label: "Prüfen und beschleunigen",
    blurb: "Die Seite ist da, aber langsam oder bei Google nicht zu finden.",
    icon: "Gauge",
  },
  {
    id: "migration",
    label: "Umzug von WordPress",
    blurb: "Die alte Seite geht ständig kaputt? Ich ziehe sie auf etwas Schnelleres um.",
    icon: "ArrowRightLeft",
  },
  {
    id: "unsure",
    label: "Noch unklar",
    blurb: "Erzählen Sie es in eigenen Worten, ich sage, was sinnvoll ist.",
    icon: "Compass",
  },
];

export const SCRIPT_DE: Record<ServiceId, KreatorQuestion[]> = {
  website: [
    {
      id: "trade",
      title: "Was macht Ihr Unternehmen?",
      hint: "Das Nächstliegende wählen oder selbst beschreiben.",
      multi: false,
      options: [
        { id: "services", label: "Arbeit beim Kunden vor Ort", hint: "Reparatur, Montage, Transport" },
        { id: "local", label: "Ein Ort, zu dem Kundschaft kommt", hint: "Werkstatt, Salon, Praxis" },
        { id: "trade", label: "Handel und Produktion" },
        { id: "food", label: "Gastronomie oder Beherbergung" },
        { id: "pro", label: "Beratung und Büroleistungen" },
      ],
    },
    {
      id: "goal",
      title: "Was soll die Seite tatsächlich leisten?",
      hint: "Mehrfachauswahl möglich.",
      multi: true,
      options: [
        { id: "calls", label: "Anrufe und Anfragen bringen" },
        { id: "trust", label: "Das Angebot zeigen und Vertrauen aufbauen" },
        { id: "booking", label: "Anmeldungen oder Termine entgegennehmen" },
        { id: "found", label: "Überhaupt gefunden werden" },
        { id: "ads", label: "Als Zielseite für Anzeigen dienen" },
      ],
    },
    {
      id: "materials",
      title: "Gibt es bereits Material?",
      hint: "Logo, Fotos, Texte — alles hilft.",
      multi: false,
      options: [
        { id: "all", label: "Logo, Fotos und Texte — alles vorhanden" },
        { id: "logo", label: "Nur ein Logo" },
        { id: "old", label: "Eine alte Seite, die aufgefrischt gehört" },
        { id: "none", label: "Nichts davon, dabei brauche ich Unterstützung" },
      ],
    },
  ],
  shop: [
    {
      id: "what",
      title: "Was soll verkauft werden?",
      multi: false,
      options: [
        { id: "physical", label: "Waren, die versendet werden" },
        { id: "digital", label: "Dateien oder Kurse zum Herunterladen" },
        { id: "services", label: "Dienstleistungen oder Termine" },
        { id: "mixed", label: "Von allem etwas" },
      ],
    },
    {
      id: "size",
      title: "Wie viele Produkte ungefähr?",
      hint: "Eine grobe Schätzung genügt.",
      multi: false,
      options: [
        { id: "few", label: "Eine Handvoll" },
        { id: "dozens", label: "Einige Dutzend" },
        { id: "hundreds", label: "Hunderte" },
        { id: "thousands", label: "Tausende" },
      ],
    },
    {
      id: "today",
      title: "Wird heute schon irgendwo verkauft?",
      multi: true,
      options: [
        { id: "allegro", label: "Auf einem Marktplatz wie eBay oder Amazon" },
        { id: "social", label: "Über Facebook oder Instagram" },
        { id: "shop", label: "Im Ladengeschäft" },
        { id: "own", label: "Es gibt einen Shop, aber er überzeugt nicht" },
        { id: "zero", label: "Alles beginnt bei null" },
      ],
    },
  ],
  app: [
    {
      id: "purpose",
      title: "Was soll das Werkzeug leisten?",
      hint: "Passendes auswählen oder in eigenen Worten beschreiben.",
      multi: true,
      options: [
        { id: "orders", label: "Aufträge und Kunden ordnen" },
        { id: "stock", label: "Warenbestand im Blick behalten" },
        { id: "calendar", label: "Termine und Besuche planen" },
        { id: "docs", label: "Dokumente an einem Ort halten" },
        { id: "team", label: "Arbeit im Team verteilen" },
      ],
    },
    {
      id: "users",
      title: "Wer wird damit arbeiten?",
      multi: false,
      options: [
        { id: "me", label: "Nur ich" },
        { id: "team", label: "Ich und mein Team" },
        { id: "clients", label: "Auch meine Kundschaft" },
        { id: "public", label: "Alle, ohne Einschränkung" },
      ],
    },
    {
      id: "current",
      title: "Wie läuft das heute?",
      multi: false,
      options: [
        { id: "excel", label: "Tabellen, Notizbuch und Zettel" },
        { id: "wrong", label: "Es gibt Software, sie passt nur nicht zur Arbeitsweise" },
        { id: "head", label: "Alles im Kopf" },
        { id: "many", label: "Mehrere Programme gleichzeitig und Durcheinander" },
      ],
    },
  ],
  ai: [
    {
      id: "relieve",
      title: "Was soll Ihnen abgenommen werden?",
      hint: "Mehrfachauswahl möglich.",
      multi: true,
      options: [
        { id: "answers", label: "Immer dieselben Kundenfragen beantworten" },
        { id: "texts", label: "Beschreibungen und Texte schreiben" },
        { id: "photos", label: "Produktfotos erstellen" },
        { id: "docs", label: "Dokumente und Daten durchgehen" },
        { id: "sorting", label: "Eingehendes sortieren" },
      ],
    },
    {
      id: "where",
      title: "Wo soll es arbeiten?",
      multi: true,
      options: [
        { id: "site", label: "Auf meiner Website" },
        { id: "chat", label: "In Messenger oder WhatsApp" },
        { id: "inside", label: "Nur intern im Unternehmen" },
        { id: "email", label: "Im Postfach" },
      ],
    },
    {
      id: "volume",
      title: "Wie oft kommt das vor?",
      multi: false,
      options: [
        { id: "few", label: "Ein paar Mal am Tag" },
        { id: "many", label: "Dutzende Male am Tag" },
        { id: "lots", label: "Hunderte Male" },
        { id: "unknown", label: "Schwer zu sagen" },
      ],
    },
  ],
  automation: [
    {
      id: "manual",
      title: "Was wird von Hand geklickt, obwohl es nicht sein müsste?",
      hint: "Mehrfachauswahl möglich.",
      multi: true,
      options: [
        { id: "copy", label: "Daten von einer Stelle zur anderen kopieren" },
        { id: "mails", label: "Immer wieder dieselben Nachrichten verschicken" },
        { id: "docs", label: "Rechnungen und Dokumente ausstellen" },
        { id: "reports", label: "Zahlen für Berichte zusammentragen" },
        { id: "orders", label: "Bestellungen von Hand abtippen" },
      ],
    },
    {
      id: "tools",
      title: "Was ist täglich im Einsatz?",
      multi: true,
      options: [
        { id: "excel", label: "Excel oder Google Tabellen" },
        { id: "mail", label: "E-Mail und Kalender" },
        { id: "sales", label: "Ein Verkaufssystem oder ein Shop" },
        { id: "accounting", label: "Buchhaltungssoftware" },
        { id: "paper", label: "Überwiegend Papier" },
      ],
    },
    {
      id: "cost",
      title: "Wie viel Zeit kostet das?",
      multi: false,
      options: [
        { id: "hour", label: "Etwa eine Stunde am Tag" },
        { id: "hours", label: "Mehrere Stunden am Tag" },
        { id: "weekly", label: "Ein paar Stunden in der Woche" },
        { id: "unknown", label: "Nie gezählt, aber zu viel" },
      ],
    },
  ],
  audit: [
    {
      id: "pain",
      title: "Was stört am meisten?",
      multi: true,
      options: [
        { id: "slow", label: "Die Seite lädt langsam" },
        { id: "google", label: "Bei Google findet uns niemand" },
        { id: "nosale", label: "Es kommen Besucher, aber nichts passiert" },
        { id: "mobile", label: "Auf dem Handy sieht es schlecht aus" },
        { id: "check", label: "Weiß ich nicht, es soll einfach geprüft werden" },
      ],
    },
    {
      id: "platform",
      title: "Worauf läuft die jetzige Seite?",
      hint: "Unbekannt ist völlig in Ordnung — dann die letzte Antwort wählen.",
      multi: false,
      options: [
        { id: "wordpress", label: "WordPress" },
        { id: "shop", label: "Ein fertiger Shop wie Shopify" },
        { id: "builder", label: "Ein Baukasten wie Wix oder Jimdo" },
        { id: "custom", label: "Von einer Agentur programmiert" },
        { id: "unknown", label: "Keine Ahnung" },
      ],
    },
    {
      id: "access",
      title: "Haben Sie Zugang zur Seite?",
      hint: "Gemeint sind die Passwörter zur Verwaltung oder zum Server.",
      multi: false,
      options: [
        { id: "full", label: "Ja, alles vorhanden" },
        { id: "partial", label: "Teilweise" },
        { id: "agency", label: "Die Firma, die sie gebaut hat, hat sie" },
        { id: "none", label: "Gar nichts" },
      ],
    },
  ],
  migration: [
    {
      id: "pain",
      title: "Was ärgert an der jetzigen Seite?",
      multi: true,
      options: [
        { id: "slow", label: "Sie ist zäh und lädt ewig" },
        { id: "breaks", label: "Ständige Aktualisierungen und Ausfälle" },
        { id: "security", label: "Die Sorge, gehackt zu werden" },
        { id: "rigid", label: "Nichts lässt sich einfach ändern" },
        { id: "cost", label: "Zu viele kostenpflichtige Erweiterungen" },
      ],
    },
    {
      id: "size",
      title: "Wie groß ist die Seite?",
      multi: false,
      options: [
        { id: "small", label: "Ein paar Unterseiten" },
        { id: "medium", label: "Ein gutes Dutzend Unterseiten" },
        { id: "blog", label: "Eine Seite mit Blog" },
        { id: "shop", label: "Ein Shop mit Produkten" },
      ],
    },
    {
      id: "look",
      title: "Und das Aussehen?",
      multi: false,
      options: [
        { id: "keep", label: "Soll so bleiben" },
        { id: "refresh", label: "Ähnlich, aber aufgefrischt" },
        { id: "new", label: "Komplett neu" },
        { id: "advice", label: "Das überlasse ich Ihnen" },
      ],
    },
  ],
  unsure: [
    {
      id: "why",
      title: "Was führt Sie hierher?",
      hint: "Das Nächstliegende wählen oder die Lage einfach beschreiben.",
      multi: true,
      options: [
        { id: "clients", label: "Ich möchte mehr Kundschaft" },
        { id: "work", label: "Ich ersticke in Handarbeit" },
        { id: "idea", label: "Ich habe eine Idee und weiß nicht, wo ich anfangen soll" },
        { id: "broken", label: "Etwas Bestehendes funktioniert schlecht" },
        { id: "modern", label: "Ich möchte besser dastehen als der Wettbewerb" },
      ],
    },
    {
      id: "state",
      title: "Gibt es bereits etwas im Internet?",
      multi: false,
      options: [
        { id: "site", label: "Eine Website" },
        { id: "shop", label: "Einen Shop" },
        { id: "social", label: "Nur Facebook oder Instagram" },
        { id: "nothing", label: "Gar nichts" },
      ],
    },
    {
      id: "dream",
      title: "Wenn das alles klappt — was ändert sich?",
      hint: "Ein Satz genügt.",
      multi: true,
      options: [
        { id: "time", label: "Ich hätte mehr Zeit" },
        { id: "money", label: "Es kämen mehr Aufträge" },
        { id: "calm", label: "Weniger Durcheinander, weniger Stress" },
        { id: "image", label: "Das Unternehmen wirkte seriöser" },
      ],
    },
  ],
};

export const CLOSING_QUESTION_DE: KreatorQuestion = {
  id: "timing",
  title: "Bis wann soll es stehen?",
  hint: "Unverbindlich — es hilft mir nur bei der Planung.",
  multi: false,
  options: [
    { id: "asap", label: "Am liebsten sofort" },
    { id: "month", label: "Innerhalb eines Monats" },
    { id: "quarter", label: "Innerhalb einiger Monate" },
    { id: "looking", label: "Ich schaue mich vorerst nur um" },
  ],
};

export const UI_DE = {
  eyebrow: "Projektassistent",
  title: "Sagen Sie, was Sie brauchen",
  subtitle:
    "Ein paar einfache Fragen. Am Ende kommt die Zusammenfassung per E-Mail, und ich melde mich mit einem Vorschlag.",
  pickService: "Womit fangen wir an?",
  pickServiceHint: "Wählen Sie, was am besten passt. Ändern lässt sich das jederzeit.",
  stepOf: "Frage {current} von {total}",
  back: "Zurück",
  next: "Weiter",
  skip: "Frage überspringen",
  chooseAtLeastOne: "Bitte etwas auswählen oder in eigenen Worten beschreiben.",
  ownWordsToggle: "Es geht um etwas anderes — ich beschreibe es selbst",
  ownWordsToggleOpen: "Eigene Beschreibung ausblenden",
  ownWordsPlaceholder: "Beschreiben Sie in eigenen Worten, worum es geht…",
  ownWordsHint: "Ganz normal schreiben, so wie Sie es einem Bekannten erklären würden.",
  thinking: "Ich überlege mir die nächste Frage…",
  summaryTitle: "So habe ich es verstanden",
  summaryHint: "Bitte durchlesen und korrigieren, falls etwas nicht stimmt.",
  summaryEdit: "Ich möchte etwas ergänzen",
  summaryEditPlaceholder: "Was sollte ich außerdem wissen?",
  yourAnswers: "Ihre Antworten",
  contactTitle: "Wohin darf die Zusammenfassung gehen?",
  contactHint: "Sie erhalten eine Kopie per E-Mail. Ich bekomme die zweite und melde mich innerhalb von 24 Stunden.",
  nameLabel: "Name oder Firmenname",
  namePlaceholder: "Max Mustermann",
  emailLabel: "E-Mail-Adresse",
  emailPlaceholder: "max@meinefirma.de",
  phoneLabel: "Telefon",
  phoneOptional: "freiwillig",
  phonePlaceholder: "0151 23456789",
  companyLabel: "Firma",
  companyPlaceholder: "Firmenname",
  submit: "Anfrage senden",
  submitting: "Wird gesendet…",
  startOver: "Von vorn beginnen",
  errorRequired: "Dieses Feld wird gebraucht.",
  errorEmail: "Bitte prüfen, ob die Adresse stimmt.",
  errorSend: "Senden fehlgeschlagen. Bitte gleich noch einmal versuchen.",
  doneTitle: "Fertig — die Anfrage ist unterwegs",
  doneBody:
    "Die Zusammenfassung liegt in Ihrem Postfach. Ich lese sie und melde mich innerhalb von 24 Stunden mit einem Vorschlag zur Umsetzung.",
  doneMeta: "Kommt in den nächsten Minuten nichts an, lohnt ein Blick in den Spam-Ordner.",
  changeService: "Ändern",
};
