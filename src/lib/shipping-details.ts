export type EcontOfficeDetails = {
  kind: "office";
  officeCode: string;
  officeName?: string;
  city?: string;
  postCode?: string;
};

export type EcontAddressDetails = {
  kind: "address";
  city: string;
  cityId?: number;
  postCode?: string;
  street: string;
  num: string;
};

export type EcontShippingDetails = EcontOfficeDetails | EcontAddressDetails;

export type EcontOfficeHit = {
  code: string;
  name: string;
  city: string;
  postCode?: string;
  address?: string;
};

export type EcontCityHit = {
  id: number;
  name: string;
  postCode: string;
  regionName?: string;
};

export function formatEcontShippingAddress(details: EcontShippingDetails) {
  if (details.kind === "office") {
    const name = details.officeName?.trim() || details.officeCode;
    const city = details.city?.trim();
    return city ? `Еконт офис ${name}, ${city}` : `Еконт офис ${name}`;
  }
  const street = details.street.trim();
  const num = details.num.trim();
  const city = details.city.trim();
  return [city, street ? `ул. ${street}` : "", num ? `№ ${num}` : ""]
    .filter(Boolean)
    .join(", ");
}

export function parseOrderShippingDetails(
  value: unknown,
): EcontShippingDetails | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (raw.kind === "office") {
    const officeCode =
      typeof raw.officeCode === "string" ? raw.officeCode.trim() : "";
    if (!officeCode) return null;
    return {
      kind: "office",
      officeCode,
      officeName:
        typeof raw.officeName === "string" ? raw.officeName : undefined,
      city: typeof raw.city === "string" ? raw.city : undefined,
      postCode: typeof raw.postCode === "string" ? raw.postCode : undefined,
    };
  }
  if (raw.kind === "address") {
    const city = typeof raw.city === "string" ? raw.city.trim() : "";
    const street = typeof raw.street === "string" ? raw.street.trim() : "";
    const num = typeof raw.num === "string" ? raw.num.trim() : "";
    if (!city || !street || !num) return null;
    return {
      kind: "address",
      city,
      street,
      num,
      cityId: typeof raw.cityId === "number" ? raw.cityId : undefined,
      postCode: typeof raw.postCode === "string" ? raw.postCode : undefined,
    };
  }
  return null;
}
