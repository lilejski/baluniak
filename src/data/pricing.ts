export interface PricingService {
    id: string;
    label: string;
    price: number;
    description: string;
}

export const PRICING_DATA: Record<string, PricingService> = {
    landing: {
        id: "landing",
        label: "Landing Page",
        price: 499,
        description: "Prosta, responsywna strona typu One-Page zoptymalizowana pod konwersję.",
    },
    biz_card: {
        id: "biz_card",
        label: "Business Card Plus",
        price: 999,
        description: "Profesjonalna wizytówka firmowa (3-5 podstron) z pełnym SEO.",
    },
    mvp: {
        id: "mvp",
        label: "SaaS MVP",
        price: 5999,
        description: "Pełnowymiarowy produkt minimum (MVP) z logowaniem i bazą danych.",
    },
    section: {
        id: "section",
        label: "Dodatkowa sekcja",
        price: 149,
        description: "Indywidualnie projektowana sekcja (np. FAQ, Galeria, Cennik).",
    },
    auth: {
        id: "auth",
        label: "System Autoryzacji",
        price: 499,
        description: "Bezpieczne logowanie (Google/Email) i profil użytkownika.",
    },
    calendar: {
        id: "calendar",
        label: "Moduł Kalendarza",
        price: 449,
        description: "System rezerwacji terminów z synchronizacją.",
    },
    analytics: {
        id: "analytics",
        label: "Analityka i Eventy",
        price: 199,
        description: "Zaawansowane śledzenie zachowań użytkowników i konwersji.",
    },
    payments: {
        id: "payments",
        label: "Płatności Online",
        price: 1299,
        description: "Integracja ze Stripe/Autopay, obsługa subskrypcji i faktur.",
    },
    cms: {
        id: "cms",
        label: "System CMS",
        price: 499,
        description: "Panel administratora do samodzielnej edycji treści.",
    },
    seo: {
        id: "seo",
        label: "SEO Premium",
        price: 299,
        description: "Zaawansowana optymalizacja pod wyszukiwarki i szybkość ładowania.",
    },
    i18n: {
        id: "i18n",
        label: "Obsługa Multi-language",
        price: 349,
        description: "Przetłumaczenie interfejsu na dodatkowe języki.",
    },
    ai_content: {
        id: "ai_content",
        label: "AI Content Engine",
        price: 499,
        description: "Automatyczne generowanie treści i grafik przez AI.",
    },
    chatbot: {
        id: "chatbot",
        label: "Chatbot AI",
        price: 999,
        description: "Inteligentny asystent wyszkolony na danych Twojej firmy.",
    },
};

export const getPriceById = (id: string): number => {
    return PRICING_DATA[id]?.price || 0;
};
