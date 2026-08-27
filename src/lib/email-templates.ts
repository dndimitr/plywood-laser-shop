export const TEMPLATE_KEYS = [
  "design_approved",
  "design_rejected",
  "shipped",
  "payment_reminder",
] as const;

export type TemplateKey = (typeof TEMPLATE_KEYS)[number];

export const TEMPLATE_LABELS: Record<TemplateKey, string> = {
  design_approved: "Макет одобрен",
  design_rejected: "Макет отказан / нужна корекция",
  shipped: "Пратката е предадена",
  payment_reminder: "Напомняне за банков превод",
};
