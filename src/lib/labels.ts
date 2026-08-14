export const laserTypeLabel: Record<string, string> = {
  ENGRAVE: "Гравиране",
  CUT: "Изрязване",
  BOTH: "Гравиране и изрязване",
};

export const orderStatusLabel: Record<string, string> = {
  NEW: "Нова",
  AWAITING_DESIGN: "Чака макет",
  DESIGN_APPROVED: "Макет одобрен",
  DESIGN_REJECTED: "Макет отказан",
  IN_PRODUCTION: "В производство",
  SHIPPED: "Изпратена",
  DONE: "Завършена",
  CANCELLED: "Отказана",
};

export const paymentMethodLabel: Record<string, string> = {
  BANK_TRANSFER: "Банков превод",
  CASH_ON_DELIVERY: "Наложен платеж при доставка",
  CARD: "Карта (онлайн)",
};

/** Label that reflects courier: COD vs cash on pickup */
export function paymentMethodLabelFor(
  method: string,
  courier?: string | null,
): string {
  if (method === "CASH_ON_DELIVERY") {
    return courier === "PICKUP"
      ? "Плащане в брой при получаване"
      : "Наложен платеж при доставка";
  }
  return paymentMethodLabel[method] ?? method;
}

export const paymentStatusLabel: Record<string, string> = {
  PENDING: "Чака плащане",
  AWAITING_TRANSFER: "Чака превод",
  PAID: "Платена",
  REFUNDED: "Възстановена",
};

export const designReviewLabel: Record<string, string> = {
  NOT_REQUIRED: "Не се изисква",
  PENDING: "За преглед",
  APPROVED: "Одобрен",
  REJECTED: "Отказан",
};

export const courierLabel: Record<string, string> = {
  ECONT: "Еконт",
  SPEEDY: "Speedy",
  PICKUP: "Лично получаване",
};

export const complexityLabel: Record<string, string> = {
  simple: "Ниска сложност",
  medium: "Средна сложност",
  complex: "Висока сложност",
};

export const materialLabel: Record<string, string> = {
  "birch-plywood": "Брезов шперплат",
  "poplar-plywood": "Тополов шперплат",
  "oak-veneer": "Дъбов фурнир",
};

export const finishLabel: Record<string, string> = {
  raw: "Без покритие",
  oil: "Масло",
  lacquer: "Лак",
};
