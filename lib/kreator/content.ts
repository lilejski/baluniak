/**
 * All Kreator copy, PL and EN, in one place — German lives in content.de.ts.
 *
 * Deliberately kept out of lib/translations.ts: this is a self-contained
 * feature with structured content (services, scripted questions), and that
 * file is already the most edit-prone in the repo.
 *
 * Writing rules for everything in here:
 *  - Jan Kowalski sells jigsaws. He has never heard of MVP, SaaS, backend,
 *    framework, stack or deployment. None of those words appear below.
 *  - Never mention price, cost, budget or "free quote".
 *  - One question at a time, answerable in two seconds.
 */

import type { KreatorQuestion, Lang, Service, ServiceId } from "./types";
import { CLOSING_QUESTION_DE, SCRIPT_DE, SERVICES_DE, UI_DE } from "./content.de";

// ─── Services ────────────────────────────────────────────────────────────────

export const SERVICES: Record<Lang, Service[]> = {
  PL: [
    {
      id: "website",
      label: "Strona internetowa",
      blurb: "Wizytówka firmy, strona z ofertą albo strona pod reklamy.",
      icon: "Globe",
    },
    {
      id: "shop",
      label: "Sklep internetowy",
      blurb: "Sprzedaż przez internet, płatności, wysyłka.",
      icon: "ShoppingBag",
    },
    {
      id: "app",
      label: "Aplikacja lub system",
      blurb: "Narzędzie do pracy szyte na miarę: panel, baza, obsługa zamówień.",
      icon: "LayoutDashboard",
    },
    {
      id: "ai",
      label: "Sztuczna inteligencja w firmie",
      blurb: "Chatbot dla klientów, automatyczne opisy, zdjęcia produktów.",
      icon: "Sparkles",
    },
    {
      id: "automation",
      label: "Automatyzacja roboty",
      blurb: "Niech komputer robi to, co dziś klikasz ręcznie.",
      icon: "Workflow",
    },
    {
      id: "audit",
      label: "Sprawdzenie i przyspieszenie",
      blurb: "Masz stronę, ale działa wolno albo nie widać jej w Google.",
      icon: "Gauge",
    },
    {
      id: "migration",
      label: "Przeprowadzka z WordPressa",
      blurb: "Stara strona ciągle się psuje? Przeniosę ją na szybsze rozwiązanie.",
      icon: "ArrowRightLeft",
    },
    {
      id: "unsure",
      label: "Jeszcze nie wiem",
      blurb: "Opowiedz własnymi słowami, a ja podpowiem, co ma sens.",
      icon: "Compass",
    },
  ],
  EN: [
    {
      id: "website",
      label: "A website",
      blurb: "A company page, a site with your offer, or a page for your ads.",
      icon: "Globe",
    },
    {
      id: "shop",
      label: "An online shop",
      blurb: "Selling online, taking payments, handling delivery.",
      icon: "ShoppingBag",
    },
    {
      id: "app",
      label: "An app or a system",
      blurb: "A tool built for how you work: a panel, a database, order handling.",
      icon: "LayoutDashboard",
    },
    {
      id: "ai",
      label: "Artificial intelligence at work",
      blurb: "A chatbot for customers, automatic descriptions, product photos.",
      icon: "Sparkles",
    },
    {
      id: "automation",
      label: "Automating the busywork",
      blurb: "Let the computer do what you click through by hand today.",
      icon: "Workflow",
    },
    {
      id: "audit",
      label: "A check-up and a speed-up",
      blurb: "You have a site, but it is slow or nobody finds it on Google.",
      icon: "Gauge",
    },
    {
      id: "migration",
      label: "Moving off WordPress",
      blurb: "Old site breaking all the time? I'll move it somewhere faster.",
      icon: "ArrowRightLeft",
    },
    {
      id: "unsure",
      label: "I'm not sure yet",
      blurb: "Tell me in your own words and I'll suggest what makes sense.",
      icon: "Compass",
    },
  ],
  DE: SERVICES_DE,
};

export function getService(lang: Lang, id: ServiceId): Service | undefined {
  return SERVICES[lang].find((s) => s.id === id);
}

// ─── Scripted questions ──────────────────────────────────────────────────────
// Used verbatim when no AI key is configured, and as the shape the model is
// asked to imitate when one is. Three per service, plus a shared closing one.

type Script = Record<ServiceId, KreatorQuestion[]>;

const SCRIPT_PL: Script = {
  website: [
    {
      id: "trade",
      title: "Czym zajmuje się firma?",
      hint: "Proszę wybrać najbliższe albo opisać po swojemu.",
      multi: false,
      options: [
        { id: "services", label: "Usługi u klienta", hint: "remonty, instalacje, transport" },
        { id: "local", label: "Punkt stacjonarny", hint: "warsztat, salon, gabinet" },
        { id: "trade", label: "Handel i produkcja" },
        { id: "food", label: "Gastronomia lub noclegi" },
        { id: "pro", label: "Doradztwo i usługi biurowe" },
      ],
    },
    {
      id: "goal",
      title: "Co ta strona ma realnie robić?",
      hint: "Można zaznaczyć kilka odpowiedzi.",
      multi: true,
      options: [
        { id: "calls", label: "Przynosić telefony i zapytania" },
        { id: "trust", label: "Pokazywać ofertę i budować zaufanie" },
        { id: "booking", label: "Przyjmować zapisy albo rezerwacje" },
        { id: "found", label: "Sprawić, żeby ludzie nas w ogóle znaleźli" },
        { id: "ads", label: "Działać jako strona pod reklamy" },
      ],
    },
    {
      id: "materials",
      title: "Czy są już jakieś materiały?",
      hint: "Logo, zdjęcia, teksty — cokolwiek.",
      multi: false,
      options: [
        { id: "all", label: "Mam logo, zdjęcia i teksty" },
        { id: "logo", label: "Mam samo logo" },
        { id: "old", label: "Mam starą stronę do odświeżenia" },
        { id: "none", label: "Nie mam nic i potrzebuję pomocy" },
      ],
    },
  ],
  shop: [
    {
      id: "what",
      title: "Co ma być sprzedawane?",
      multi: false,
      options: [
        { id: "physical", label: "Rzeczy, które trzeba wysłać" },
        { id: "digital", label: "Pliki do pobrania albo kursy" },
        { id: "services", label: "Usługi lub terminy" },
        { id: "mixed", label: "Po trochu wszystkiego" },
      ],
    },
    {
      id: "size",
      title: "Ile mniej więcej produktów?",
      hint: "Wystarczy przybliżona liczba.",
      multi: false,
      options: [
        { id: "few", label: "Kilka" },
        { id: "dozens", label: "Kilkadziesiąt" },
        { id: "hundreds", label: "Setki" },
        { id: "thousands", label: "Tysiące" },
      ],
    },
    {
      id: "today",
      title: "Czy sprzedaż już gdzieś się odbywa?",
      multi: true,
      options: [
        { id: "allegro", label: "Na Allegro lub podobnych" },
        { id: "social", label: "Przez Facebooka albo Instagram" },
        { id: "shop", label: "W sklepie stacjonarnym" },
        { id: "own", label: "Mam już sklep, ale mnie nie zadowala" },
        { id: "zero", label: "Zaczynam od zera" },
      ],
    },
  ],
  app: [
    {
      id: "purpose",
      title: "Co ma robić to narzędzie?",
      hint: "Proszę zaznaczyć, co pasuje, albo opisać własnymi słowami.",
      multi: true,
      options: [
        { id: "orders", label: "Ogarniać zamówienia i klientów" },
        { id: "stock", label: "Pilnować magazynu i towaru" },
        { id: "calendar", label: "Umawiać terminy i wizyty" },
        { id: "docs", label: "Trzymać dokumenty w jednym miejscu" },
        { id: "team", label: "Rozdzielać pracę w zespole" },
      ],
    },
    {
      id: "users",
      title: "Kto będzie z tego korzystał?",
      multi: false,
      options: [
        { id: "me", label: "Tylko ja" },
        { id: "team", label: "Ja i mój zespół" },
        { id: "clients", label: "Także moi klienci" },
        { id: "public", label: "Każdy z ulicy" },
      ],
    },
    {
      id: "current",
      title: "Jak wygląda to dzisiaj?",
      multi: false,
      options: [
        { id: "excel", label: "Excel, zeszyt i kartki" },
        { id: "wrong", label: "Mam program, ale nie pasuje do mojej roboty" },
        { id: "head", label: "Wszystko mam w głowie" },
        { id: "many", label: "Kilka programów naraz i bałagan" },
      ],
    },
  ],
  ai: [
    {
      id: "relieve",
      title: "Co powinno zniknąć z listy obowiązków?",
      hint: "Można zaznaczyć kilka odpowiedzi.",
      multi: true,
      options: [
        { id: "answers", label: "Odpowiadanie na te same pytania klientów" },
        { id: "texts", label: "Pisanie opisów i treści" },
        { id: "photos", label: "Robienie zdjęć produktów" },
        { id: "docs", label: "Przeglądanie dokumentów i danych" },
        { id: "sorting", label: "Segregowanie tego, co przychodzi" },
      ],
    },
    {
      id: "where",
      title: "Gdzie to ma działać?",
      multi: true,
      options: [
        { id: "site", label: "Na mojej stronie" },
        { id: "chat", label: "W Messengerze lub WhatsAppie" },
        { id: "inside", label: "Tylko wewnątrz firmy" },
        { id: "email", label: "W skrzynce mailowej" },
      ],
    },
    {
      id: "volume",
      title: "Jak często to się dzieje?",
      multi: false,
      options: [
        { id: "few", label: "Kilka razy dziennie" },
        { id: "many", label: "Kilkadziesiąt razy dziennie" },
        { id: "lots", label: "Setki razy" },
        { id: "unknown", label: "Ciężko powiedzieć" },
      ],
    },
  ],
  automation: [
    {
      id: "manual",
      title: "Co dziś robi się ręcznie, choć nie powinno?",
      hint: "Można zaznaczyć kilka odpowiedzi.",
      multi: true,
      options: [
        { id: "copy", label: "Przepisywanie danych z jednego miejsca w drugie" },
        { id: "mails", label: "Wysyłanie w kółko tych samych wiadomości" },
        { id: "docs", label: "Wystawianie faktur i dokumentów" },
        { id: "reports", label: "Zbieranie danych do zestawień" },
        { id: "orders", label: "Ręczne przeklepywanie zamówień" },
      ],
    },
    {
      id: "tools",
      title: "Z czego firma korzysta na co dzień?",
      multi: true,
      options: [
        { id: "excel", label: "Excel albo Arkusze Google" },
        { id: "mail", label: "Poczta i kalendarz" },
        { id: "sales", label: "System sprzedaży lub sklep" },
        { id: "accounting", label: "Program księgowy" },
        { id: "paper", label: "Głównie papier" },
      ],
    },
    {
      id: "cost",
      title: "Ile czasu to zjada?",
      multi: false,
      options: [
        { id: "hour", label: "Jakąś godzinę dziennie" },
        { id: "hours", label: "Kilka godzin dziennie" },
        { id: "weekly", label: "Kilka godzin w tygodniu" },
        { id: "unknown", label: "Nie liczyłem, ale za dużo" },
      ],
    },
  ],
  audit: [
    {
      id: "pain",
      title: "Co przeszkadza najbardziej?",
      multi: true,
      options: [
        { id: "slow", label: "Strona wczytuje się wolno" },
        { id: "google", label: "Nie widać nas w Google" },
        { id: "nosale", label: "Ludzie wchodzą, ale nic z tego nie ma" },
        { id: "mobile", label: "Na telefonie wygląda źle" },
        { id: "check", label: "Nie wiem, chcę po prostu sprawdzić" },
      ],
    },
    {
      id: "platform",
      title: "Na czym stoi obecna strona?",
      hint: "Brak pewności nie jest problemem — wtedy ostatnia opcja.",
      multi: false,
      options: [
        { id: "wordpress", label: "WordPress" },
        { id: "shop", label: "Gotowy sklep, np. Shoper lub Shopify" },
        { id: "builder", label: "Kreator typu Wix czy Squarespace" },
        { id: "custom", label: "Robił to programista" },
        { id: "unknown", label: "Nie mam pojęcia" },
      ],
    },
    {
      id: "access",
      title: "Czy jest dostęp do strony?",
      hint: "Chodzi o hasła do panelu albo do serwera.",
      multi: false,
      options: [
        { id: "full", label: "Tak, wszystko mam" },
        { id: "partial", label: "Częściowo" },
        { id: "agency", label: "Ma je firma, która robiła stronę" },
        { id: "none", label: "Nie mam nic" },
      ],
    },
  ],
  migration: [
    {
      id: "pain",
      title: "Co przeszkadza w obecnej stronie?",
      multi: true,
      options: [
        { id: "slow", label: "Muli i długo się wczytuje" },
        { id: "breaks", label: "Ciągłe aktualizacje i awarie" },
        { id: "security", label: "Boję się włamania" },
        { id: "rigid", label: "Nic nie da się łatwo zmienić" },
        { id: "cost", label: "Za dużo dopłat za wtyczki" },
      ],
    },
    {
      id: "size",
      title: "Jak duża jest ta strona?",
      multi: false,
      options: [
        { id: "small", label: "Kilka podstron" },
        { id: "medium", label: "Kilkanaście podstron" },
        { id: "blog", label: "Strona razem z blogiem" },
        { id: "shop", label: "Sklep z produktami" },
      ],
    },
    {
      id: "look",
      title: "Co z wyglądem?",
      multi: false,
      options: [
        { id: "keep", label: "Ma zostać taki sam" },
        { id: "refresh", label: "Podobny, ale odświeżony" },
        { id: "new", label: "Chcę zupełnie nowy" },
        { id: "advice", label: "Zdaję się na Ciebie" },
      ],
    },
  ],
  unsure: [
    {
      id: "why",
      title: "Co jest powodem kontaktu?",
      hint: "Proszę wybrać najbliższe albo po prostu opisać sytuację.",
      multi: true,
      options: [
        { id: "clients", label: "Chcę mieć więcej klientów" },
        { id: "work", label: "Tonę w ręcznej robocie" },
        { id: "idea", label: "Mam pomysł i nie wiem, od czego zacząć" },
        { id: "broken", label: "Coś, co mam, działa źle" },
        { id: "modern", label: "Chcę wyglądać nowocześniej niż konkurencja" },
      ],
    },
    {
      id: "state",
      title: "Czy firma ma już cokolwiek w internecie?",
      multi: false,
      options: [
        { id: "site", label: "Mam stronę" },
        { id: "shop", label: "Mam sklep" },
        { id: "social", label: "Tylko Facebooka lub Instagram" },
        { id: "nothing", label: "Zupełnie nic" },
      ],
    },
    {
      id: "dream",
      title: "Gdyby wszystko się udało, co by się zmieniło?",
      hint: "Jedno zdanie wystarczy.",
      multi: true,
      options: [
        { id: "time", label: "Miałbym więcej czasu" },
        { id: "money", label: "Więcej zamówień" },
        { id: "calm", label: "Mniej bałaganu i nerwów" },
        { id: "image", label: "Firma wyglądałaby poważniej" },
      ],
    },
  ],
};

const SCRIPT_EN: Script = {
  website: [
    {
      id: "trade",
      title: "What does your business do?",
      hint: "Pick the closest one, or write it your own way.",
      multi: false,
      options: [
        { id: "services", label: "Work at the customer's place", hint: "repairs, installation, transport" },
        { id: "local", label: "A place people come to", hint: "workshop, salon, clinic" },
        { id: "trade", label: "Trade and manufacturing" },
        { id: "food", label: "Food or accommodation" },
        { id: "pro", label: "Consulting and office services" },
      ],
    },
    {
      id: "goal",
      title: "What should this site actually do for you?",
      hint: "You can tick several.",
      multi: true,
      options: [
        { id: "calls", label: "Bring in calls and enquiries" },
        { id: "trust", label: "Show what I offer and build trust" },
        { id: "booking", label: "Take sign-ups or bookings" },
        { id: "found", label: "Make people find us at all" },
        { id: "ads", label: "Work as a page behind my ads" },
      ],
    },
    {
      id: "materials",
      title: "Do you have any materials already?",
      hint: "A logo, photos, text — anything.",
      multi: false,
      options: [
        { id: "all", label: "Logo, photos and text — all of it" },
        { id: "logo", label: "Just a logo" },
        { id: "old", label: "An old site that needs refreshing" },
        { id: "none", label: "Nothing at all, I need help with it" },
      ],
    },
  ],
  shop: [
    {
      id: "what",
      title: "What do you want to sell?",
      multi: false,
      options: [
        { id: "physical", label: "Things that have to be shipped" },
        { id: "digital", label: "Downloads or courses" },
        { id: "services", label: "Services or appointments" },
        { id: "mixed", label: "A bit of everything" },
      ],
    },
    {
      id: "size",
      title: "Roughly how many products?",
      hint: "A rough guess is fine.",
      multi: false,
      options: [
        { id: "few", label: "A handful" },
        { id: "dozens", label: "A few dozen" },
        { id: "hundreds", label: "Hundreds" },
        { id: "thousands", label: "Thousands" },
      ],
    },
    {
      id: "today",
      title: "Are you selling anywhere right now?",
      multi: true,
      options: [
        { id: "allegro", label: "On a marketplace like eBay or Amazon" },
        { id: "social", label: "Through Facebook or Instagram" },
        { id: "shop", label: "In a physical shop" },
        { id: "own", label: "I have a shop already but I'm not happy with it" },
        { id: "zero", label: "Starting from scratch" },
      ],
    },
  ],
  app: [
    {
      id: "purpose",
      title: "What should this tool do?",
      hint: "Tick what fits, or describe it in your own words.",
      multi: true,
      options: [
        { id: "orders", label: "Keep orders and customers in order" },
        { id: "stock", label: "Keep track of stock and goods" },
        { id: "calendar", label: "Book appointments and visits" },
        { id: "docs", label: "Keep documents in one place" },
        { id: "team", label: "Hand out work across the team" },
      ],
    },
    {
      id: "users",
      title: "Who is going to use it?",
      multi: false,
      options: [
        { id: "me", label: "Only me" },
        { id: "team", label: "Me and my team" },
        { id: "clients", label: "My customers too" },
        { id: "public", label: "Anyone at all" },
      ],
    },
    {
      id: "current",
      title: "How do you handle this today?",
      multi: false,
      options: [
        { id: "excel", label: "Spreadsheets, a notebook and scraps of paper" },
        { id: "wrong", label: "I have software, but it doesn't fit how I work" },
        { id: "head", label: "I keep it all in my head" },
        { id: "many", label: "Several programs at once and a mess" },
      ],
    },
  ],
  ai: [
    {
      id: "relieve",
      title: "What would you like taken off your plate?",
      hint: "You can tick several.",
      multi: true,
      options: [
        { id: "answers", label: "Answering the same customer questions" },
        { id: "texts", label: "Writing descriptions and content" },
        { id: "photos", label: "Taking product photos" },
        { id: "docs", label: "Going through documents and data" },
        { id: "sorting", label: "Sorting whatever comes in" },
      ],
    },
    {
      id: "where",
      title: "Where should it work?",
      multi: true,
      options: [
        { id: "site", label: "On my website" },
        { id: "chat", label: "In Messenger or WhatsApp" },
        { id: "inside", label: "Inside the company only" },
        { id: "email", label: "In my inbox" },
      ],
    },
    {
      id: "volume",
      title: "How often does this happen?",
      multi: false,
      options: [
        { id: "few", label: "A few times a day" },
        { id: "many", label: "Dozens of times a day" },
        { id: "lots", label: "Hundreds of times" },
        { id: "unknown", label: "Hard to say" },
      ],
    },
  ],
  automation: [
    {
      id: "manual",
      title: "What do you click through by hand that you shouldn't?",
      hint: "You can tick several.",
      multi: true,
      options: [
        { id: "copy", label: "Copying data from one place to another" },
        { id: "mails", label: "Sending the same messages over and over" },
        { id: "docs", label: "Issuing invoices and documents" },
        { id: "reports", label: "Pulling numbers together for reports" },
        { id: "orders", label: "Re-typing orders by hand" },
      ],
    },
    {
      id: "tools",
      title: "What do you use day to day?",
      multi: true,
      options: [
        { id: "excel", label: "Excel or Google Sheets" },
        { id: "mail", label: "Email and a calendar" },
        { id: "sales", label: "A sales system or a shop" },
        { id: "accounting", label: "Accounting software" },
        { id: "paper", label: "Mostly paper" },
      ],
    },
    {
      id: "cost",
      title: "How much time does it eat?",
      multi: false,
      options: [
        { id: "hour", label: "About an hour a day" },
        { id: "hours", label: "Several hours a day" },
        { id: "weekly", label: "A few hours a week" },
        { id: "unknown", label: "Never counted, but too much" },
      ],
    },
  ],
  audit: [
    {
      id: "pain",
      title: "What bothers you most?",
      multi: true,
      options: [
        { id: "slow", label: "The site loads slowly" },
        { id: "google", label: "Nobody finds us on Google" },
        { id: "nosale", label: "People visit but nothing comes of it" },
        { id: "mobile", label: "It looks bad on a phone" },
        { id: "check", label: "I don't know, I just want it checked" },
      ],
    },
    {
      id: "platform",
      title: "What is the current site built on?",
      hint: "If you don't know, that's fine — pick the last option.",
      multi: false,
      options: [
        { id: "wordpress", label: "WordPress" },
        { id: "shop", label: "A ready-made shop like Shopify" },
        { id: "builder", label: "A builder like Wix or Squarespace" },
        { id: "custom", label: "A developer built it" },
        { id: "unknown", label: "No idea" },
      ],
    },
    {
      id: "access",
      title: "Do you have access to the site?",
      hint: "Meaning the passwords to the panel or the server.",
      multi: false,
      options: [
        { id: "full", label: "Yes, I have everything" },
        { id: "partial", label: "Partly" },
        { id: "agency", label: "The company that built it has them" },
        { id: "none", label: "Nothing at all" },
      ],
    },
  ],
  migration: [
    {
      id: "pain",
      title: "What annoys you about the current site?",
      multi: true,
      options: [
        { id: "slow", label: "It drags and takes ages to load" },
        { id: "breaks", label: "Constant updates and breakages" },
        { id: "security", label: "I worry about being hacked" },
        { id: "rigid", label: "Nothing can be changed easily" },
        { id: "cost", label: "Too many add-ons to pay for" },
      ],
    },
    {
      id: "size",
      title: "How big is the site?",
      multi: false,
      options: [
        { id: "small", label: "A few pages" },
        { id: "medium", label: "A dozen or so pages" },
        { id: "blog", label: "A site with a blog" },
        { id: "shop", label: "A shop with products" },
      ],
    },
    {
      id: "look",
      title: "What about the way it looks?",
      multi: false,
      options: [
        { id: "keep", label: "It should stay the same" },
        { id: "refresh", label: "Similar, but freshened up" },
        { id: "new", label: "I want something completely new" },
        { id: "advice", label: "I'll leave that to you" },
      ],
    },
  ],
  unsure: [
    {
      id: "why",
      title: "What brings you here?",
      hint: "Pick the closest one, or just describe your situation.",
      multi: true,
      options: [
        { id: "clients", label: "I want more customers" },
        { id: "work", label: "I'm drowning in manual work" },
        { id: "idea", label: "I have an idea and don't know where to start" },
        { id: "broken", label: "Something I have works badly" },
        { id: "modern", label: "I want to look sharper than my competition" },
      ],
    },
    {
      id: "state",
      title: "Do you have anything online already?",
      multi: false,
      options: [
        { id: "site", label: "I have a website" },
        { id: "shop", label: "I have a shop" },
        { id: "social", label: "Only Facebook or Instagram" },
        { id: "nothing", label: "Nothing whatsoever" },
      ],
    },
    {
      id: "dream",
      title: "If this all worked out, what would change?",
      hint: "One sentence is plenty.",
      multi: true,
      options: [
        { id: "time", label: "I'd have more time" },
        { id: "money", label: "More orders coming in" },
        { id: "calm", label: "Less mess and less stress" },
        { id: "image", label: "The business would look more serious" },
      ],
    },
  ],
};

/** Asked last, whatever the path. */
const CLOSING_QUESTION: Record<Lang, KreatorQuestion> = {
  PL: {
    id: "timing",
    title: "Na kiedy to ma być gotowe?",
    hint: "Bez zobowiązań — to tylko wskazówka do planowania.",
    multi: false,
    options: [
      { id: "asap", label: "Najchętniej od zaraz" },
      { id: "month", label: "W ciągu miesiąca" },
      { id: "quarter", label: "W ciągu kilku miesięcy" },
      { id: "looking", label: "Na razie się rozglądam" },
    ],
  },
  DE: CLOSING_QUESTION_DE,
  EN: {
    id: "timing",
    title: "When would you like this ready?",
    hint: "No commitment — it just tells me how to plan it.",
    multi: false,
    options: [
      { id: "asap", label: "As soon as possible" },
      { id: "month", label: "Within a month" },
      { id: "quarter", label: "Within a few months" },
      { id: "looking", label: "Just looking around for now" },
    ],
  },
};

export const SCRIPT: Record<Lang, Script> = { PL: SCRIPT_PL, EN: SCRIPT_EN, DE: SCRIPT_DE };

/** Total number of questions a scripted run asks. */
export const SCRIPT_LENGTH = 4;

/**
 * The scripted question for a given position, or null when the run is over.
 * Position is zero-based and equals how many answers are already in.
 */
export function scriptedQuestion(
  lang: Lang,
  serviceId: ServiceId,
  position: number
): KreatorQuestion | null {
  const path = SCRIPT[lang][serviceId];
  if (position < path.length) return path[position];
  if (position === path.length) return CLOSING_QUESTION[lang];
  return null;
}

// ─── Interface copy ──────────────────────────────────────────────────────────

const UI_PL = {
    eyebrow: "Kreator zamówienia",
    title: "Kilka pytań o projekt",
    subtitle:
      "Kilka prostych pytań. Na koniec podsumowanie trafi na maila, a ja odezwę się z propozycją.",
    pickService: "Od czego zaczynamy?",
    pickServiceHint: "Proszę wybrać najbliższą opcję. Zawsze można zmienić zdanie.",
    stepOf: "Pytanie {current} z {total}",
    back: "Wstecz",
    next: "Dalej",
    skip: "Pomiń to pytanie",
    chooseAtLeastOne: "Proszę zaznaczyć opcję albo opisać własnymi słowami.",
    ownWordsToggle: "Chodzi mi o coś innego — opiszę to sam",
    ownWordsToggleOpen: "Schowaj własny opis",
    ownWordsPlaceholder: "Opis własnymi słowami…",
    ownWordsHint: "Zwyczajnym językiem, bez technicznych określeń.",
    thinking: "Zastanawiam się nad kolejnym pytaniem…",
    summaryTitle: "Tak to zrozumiałem",
    summaryHint: "Proszę sprawdzić i poprawić, jeśli coś się nie zgadza.",
    summaryEdit: "Chcę coś dopowiedzieć",
    summaryEditPlaceholder: "Co jeszcze powinienem wiedzieć?",
    yourAnswers: "Udzielone odpowiedzi",
    contactTitle: "Gdzie wysłać podsumowanie?",
    contactHint: "Kopia trafi na podany adres, druga przychodzi do mnie. Odezwę się w ciągu 24 godzin.",
    nameLabel: "Imię lub nazwa firmy",
    namePlaceholder: "Jan Kowalski",
    emailLabel: "Adres email",
    emailPlaceholder: "jan@mojafirma.pl",
    phoneLabel: "Telefon",
    phoneOptional: "nieobowiązkowo",
    phonePlaceholder: "600 100 200",
    companyLabel: "Firma",
    companyPlaceholder: "Nazwa firmy",
    submit: "Wyślij zgłoszenie",
    submitting: "Wysyłam…",
    startOver: "Zacznij od nowa",
    errorRequired: "To pole jest potrzebne.",
    errorEmail: "Proszę sprawdzić poprawność adresu.",
    errorSend: "Nie udało się wysłać. Proszę spróbować ponownie za chwilę.",
    doneTitle: "Gotowe — zgłoszenie wysłane",
    doneBody:
      "Podsumowanie trafiło na podany adres. Przeczytam je i odezwę się w ciągu 24 godzin z propozycją realizacji.",
    doneMeta: "Jeśli wiadomość nie dotrze w kilka minut, warto zajrzeć do folderu ze spamem.",
    changeService: "Zmień",
};

/** The copy contract every language must satisfy. */
export type KreatorCopy = typeof UI_PL;

const UI_EN: KreatorCopy = {
    eyebrow: "Order builder",
    title: "A few questions about the project",
    subtitle:
      "A few plain questions. At the end a summary goes out by email, and I come back with a proposal.",
    pickService: "Where do we start?",
    pickServiceHint: "Pick whatever fits best. You can always change your mind.",
    stepOf: "Question {current} of {total}",
    back: "Back",
    next: "Next",
    skip: "Skip this question",
    chooseAtLeastOne: "Pick something, or describe it in your own words.",
    ownWordsToggle: "I mean something else — let me describe it",
    ownWordsToggleOpen: "Hide my own description",
    ownWordsPlaceholder: "Describe in your own words what you have in mind…",
    ownWordsHint: "Plain words are fine — no technical terms needed.",
    thinking: "Working out the next question…",
    summaryTitle: "Here's what I understood",
    summaryHint: "Read it over and correct me if anything is off.",
    summaryEdit: "I'd like to add something",
    summaryEditPlaceholder: "What else should I know?",
    yourAnswers: "Your answers",
    contactTitle: "Where should the summary go?",
    contactHint: "You get a copy by email. I get the other one and reply within 24 hours.",
    nameLabel: "Your name or company",
    namePlaceholder: "John Smith",
    emailLabel: "Email address",
    emailPlaceholder: "john@mycompany.com",
    phoneLabel: "Phone",
    phoneOptional: "optional",
    phonePlaceholder: "+44 7700 900000",
    companyLabel: "Company",
    companyPlaceholder: "Company name",
    submit: "Send the enquiry",
    submitting: "Sending…",
    startOver: "Start over",
    errorRequired: "This one is needed.",
    errorEmail: "Check that the address is right.",
    errorSend: "Sending failed. Please try again in a moment.",
    doneTitle: "Done — your enquiry is on its way",
    doneBody:
      "The summary has landed in your inbox. I'll read it and come back within 24 hours with how I'd approach it.",
    doneMeta: "If nothing arrives within a few minutes, have a look in your spam folder.",
    changeService: "Change",
};

export const UI: Record<Lang, KreatorCopy> = { PL: UI_PL, EN: UI_EN, DE: UI_DE };
