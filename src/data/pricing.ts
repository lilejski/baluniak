export interface PricingService {
    id: string;
    label: string;
    price: number;
}

export const PRICING_DATA: Record<string, PricingService> = {
    landing: {
        id: "landing",
        label: "Landing Page (prosta)",
        price: 499,
    },
    biz_card: {
        id: "biz_card",
        label: "Wizytówka firmowa",
        price: 799,
    },
    mvp: {
        id: "mvp",
        label: "MVP / Aplikacja",
        price: 2999,
    },
    section: {
        id: "section",
        label: "Dodatkowa sekcja",
        price: 149,
    },
    cms: {
        id: "cms",
        label: "CMS (zarządzanie treścią)",
        price: 499,
    },
    seo: {
        id: "seo",
        label: "SEO + Optymalizacja",
        price: 299,
    },
    i18n: {
        id: "i18n",
        label: "Wielojęzyczność (i18n)",
        price: 349,
    },
    ai_content: {
        id: "ai_content",
        label: "AI Content Engine",
        price: 499,
    },
    chatbot: {
        id: "chatbot",
        label: "Chatbot AI",
        price: 999,
    },
    payments: {
        id: "payments",
        label: "Integracja płatności",
        price: 399,
    },
};

export const getPriceById = (id: string): number => {
    return PRICING_DATA[id]?.price || 0;
};
