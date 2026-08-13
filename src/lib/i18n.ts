export type Locale = "bg" | "en";

const dict = {
  bg: {
    catalog: "Каталог",
    custom: "По файл",
    cart: "Количка",
    howItWorks: "Как работи",
    addToCart: "Добави в количката",
    checkout: "Към данни за доставка",
    search: "Търсене…",
    allCategories: "Всички категории",
    recentlyViewed: "Наскоро разгледани",
    reviews: "Отзиви",
    rush: "Ускорена изработка (+50%)",
    invoice: "Искам фактура",
    courier: "Куриер",
  },
  en: {
    catalog: "Catalog",
    custom: "Custom file",
    cart: "Cart",
    howItWorks: "How it works",
    addToCart: "Add to cart",
    checkout: "Continue to shipping",
    search: "Search…",
    allCategories: "All categories",
    recentlyViewed: "Recently viewed",
    reviews: "Reviews",
    rush: "Rush production (+50%)",
    invoice: "I need an invoice",
    courier: "Courier",
  },
} as const;

export type DictKey = keyof typeof dict.bg;

export function t(locale: Locale, key: DictKey) {
  return dict[locale][key] ?? dict.bg[key];
}

export function getDict(locale: Locale) {
  return dict[locale];
}
