export type Locale = "bg" | "en";

const dict = {
  bg: {
    catalog: "Каталог",
    custom: "Ваш дизайн",
    cart: "Количка",
    howItWorks: "Как работи",
    addToCart: "Добави в количката",
    checkout: "Към поръчката",
    search: "Търси подарък…",
    allCategories: "Всички категории",
    recentlyViewed: "Наскоро разгледани",
    reviews: "Отзиви",
    rush: "Ускорена изработка (+50%)",
    invoice: "Искам фактура",
    courier: "Куриер",
  },
  en: {
    catalog: "Catalog",
    custom: "Your design",
    cart: "Cart",
    howItWorks: "How it works",
    addToCart: "Add to cart",
    checkout: "Place order",
    search: "Search a gift…",
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
