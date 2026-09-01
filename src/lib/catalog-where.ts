/** Filter for live catalog products. Do not spread onto PricingRule. */
export const catalogProductWhere = {
  active: true,
  availability: "IN_STOCK" as const,
};
