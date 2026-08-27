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
  CASH_ON_DELIVERY: "Наложен платеж",
  CARD: "Карта (онлайн)",
};

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

export const machineStatusLabel: Record<string, string> = {
  NONE: "Не е в опашка",
  QUEUE: "Опашка за рязане",
  CUTTING: "В рязане",
  PACKING_READY: "Готово за опаковане",
};

export const availabilityLabel: Record<string, string> = {
  IN_STOCK: "В наличност",
  OUT_OF_STOCK: "Изчерпан",
  SEASONAL_PAUSE: "Сезонно спрян",
};

export const customerFlagLabel: Record<string, string> = {
  NONE: "Нормален",
  WATCH: "Внимание",
  BLOCKED: "Блокиран",
};

export function shortOrderId(id: string) {
  return id.slice(-8).toUpperCase();
}

export function orderStatusTone(status: string) {
  if (status === "NEW" || status === "AWAITING_DESIGN") return "warn";
  if (status === "SHIPPED" || status === "DONE") return "ok";
  if (status === "CANCELLED" || status === "DESIGN_REJECTED") return "bad";
  return "neutral";
}

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
