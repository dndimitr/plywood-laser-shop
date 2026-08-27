import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import {
  parseOrderShippingDetails,
  type EcontCityHit,
  type EcontOfficeHit,
  type EcontShippingDetails,
} from "@/lib/shipping-details";

export type { EcontCityHit, EcontOfficeHit } from "@/lib/shipping-details";

const NOMENCLATURE_TTL_MS = 12 * 60 * 60 * 1000;

type Cached<T> = { at: number; data: T };

const CACHE_DIR = path.join(tmpdir(), "plywood-econt");

function readDiskCache<T>(name: string): Cached<T> | null {
  try {
    const file = path.join(CACHE_DIR, `${name}.json`);
    if (!existsSync(file)) return null;
    const parsed = JSON.parse(readFileSync(file, "utf8")) as Cached<T>;
    if (!parsed?.at || !Array.isArray(parsed.data)) return null;
    if (Date.now() - parsed.at > NOMENCLATURE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeDiskCache<T>(name: string, data: T) {
  try {
    if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
    writeFileSync(
      path.join(CACHE_DIR, `${name}.json`),
      JSON.stringify({ at: Date.now(), data }),
    );
  } catch {
    // best-effort cache
  }
}

let officesCache: Cached<EcontOfficeHit[]> | null = null;
let citiesCache: Cached<EcontCityHit[]> | null = null;
let officesInflight: Promise<EcontOfficeHit[]> | null = null;
let citiesInflight: Promise<EcontCityHit[]> | null = null;

function econtBaseUrl() {
  return process.env.ECONT_DEMO === "1"
    ? "https://demo.econt.com/ee/services"
    : "https://ee.econt.com/services";
}

function deliveryBaseUrl() {
  return process.env.ECONT_DEMO === "1"
    ? "https://delivery-demo.econt.com/services"
    : "https://delivery.econt.com/services";
}

function econtAuthHeader() {
  const username = process.env.ECONT_USERNAME?.trim();
  const password = process.env.ECONT_PASSWORD;
  if (!username || !password) return null;
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

function parseDeliveryCredentials() {
  const combined = process.env.ECONT_PRIVATE_KEY?.trim() ?? "";
  if (combined.includes("@")) {
    const at = combined.indexOf("@");
    return {
      storeId: combined.slice(0, at).trim(),
      privateKey: combined.slice(at + 1).trim(),
    };
  }
  return {
    storeId: process.env.ECONT_STORE_ID?.trim() ?? "",
    privateKey: combined,
  };
}

export function isEcontConfigured() {
  return Boolean(parseDeliveryCredentials().privateKey);
}

function econtConfigError() {
  return "Еконт не е конфигуриран. Добавете ECONT_PRIVATE_KEY (код за връзка от delivery.econt.com).";
}

export class EcontApiError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = "EcontApiError";
    this.status = status;
  }
}

function isEcontErrorPayload(data: unknown) {
  if (!data || typeof data !== "object") return false;
  const raw = data as { type?: unknown; message?: unknown };
  return (
    typeof raw.type === "string" &&
    raw.type.length > 0 &&
    typeof raw.message === "string" &&
    raw.message.length > 0
  );
}

function messageFromEcontError(data: unknown) {
  if (!data || typeof data !== "object") return "";
  const raw = data as {
    message?: unknown;
    innerErrors?: Array<{ message?: unknown }>;
  };
  const parts: string[] = [];
  if (typeof raw.message === "string" && raw.message.trim()) {
    parts.push(raw.message.trim());
  }
  for (const inner of raw.innerErrors ?? []) {
    if (typeof inner.message === "string" && inner.message.trim()) {
      parts.push(inner.message.trim());
    }
  }
  return parts.join(" — ");
}

function throwIfEcontError(data: unknown) {
  if (!isEcontErrorPayload(data)) return;
  const raw = data as { type: string };
  throw new EcontApiError(
    messageFromEcontError(data),
    raw.type === "ExInvalidParam" ? 400 : 502,
  );
}

async function postJson(
  url: string,
  body: unknown,
  headers: Record<string, string>,
) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    });

    const text = await res.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text) as unknown;
      } catch {
        throw new EcontApiError(
          "Еконт върна невалиден отговор. Опитайте отново.",
          502,
        );
      }
    }

    throwIfEcontError(data);

    if (!res.ok) {
      throw new EcontApiError(
        messageFromEcontError(data) || `Еконт грешка (${res.status})`,
        res.status === 401 || res.status === 403 ? res.status : 502,
      );
    }

    return data;
  } catch (err) {
    if (err instanceof EcontApiError) throw err;
    if (
      err instanceof Error &&
      (err.name === "TimeoutError" || err.name === "AbortError")
    ) {
      throw new EcontApiError(
        "Еконт не отговори навреме. Опитайте отново.",
        504,
      );
    }
    throw err;
  }
}

async function econtPost(
  path: string,
  body: unknown,
  options?: { auth?: boolean },
) {
  const headers: Record<string, string> = {};
  if (options?.auth) {
    const auth = econtAuthHeader();
    if (!auth) {
      throw new EcontApiError(econtConfigError(), 503);
    }
    headers.Authorization = auth;
  }
  return postJson(`${econtBaseUrl()}/${path}`, body, headers);
}

async function deliveryPost(path: string, body: unknown) {
  const { privateKey } = parseDeliveryCredentials();
  if (!privateKey) {
    throw new EcontApiError(econtConfigError(), 503);
  }
  return postJson(`${deliveryBaseUrl()}/${path}`, body, {
    Authorization: privateKey,
  });
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function cacheValid<T>(entry: Cached<T> | null) {
  return Boolean(entry && Date.now() - entry.at < NOMENCLATURE_TTL_MS);
}

async function econtNomenclature(path: string, body: unknown) {
  try {
    return await econtPost(path, body);
  } catch (err) {
    if (
      err instanceof EcontApiError &&
      (err.status === 401 || err.status === 403) &&
      econtAuthHeader()
    ) {
      return econtPost(path, body, { auth: true });
    }
    throw err;
  }
}

async function loadOffices(): Promise<EcontOfficeHit[]> {
  if (cacheValid(officesCache) && officesCache) return officesCache.data;
  const disk = readDiskCache<EcontOfficeHit[]>("offices-bgr");
  if (disk) {
    officesCache = disk;
    return disk.data;
  }
  if (officesInflight) return officesInflight;
  officesInflight = (async () => {
    const data = await econtNomenclature(
      "Nomenclatures/NomenclaturesService.getOffices.json",
      { countryCode: "BGR" },
    );
    const list = asRecord(data)?.offices;
    const offices = Array.isArray(list) ? list : [];
    const mapped: EcontOfficeHit[] = [];
    for (const item of offices) {
      const office = asRecord(item);
      if (!office) continue;
      const code = typeof office.code === "string" ? office.code : "";
      const name = typeof office.name === "string" ? office.name : "";
      if (!code || !name) continue;
      const address = asRecord(office.address);
      const city = asRecord(address?.city);
      mapped.push({
        code,
        name,
        city: typeof city?.name === "string" ? city.name : "",
        postCode: typeof city?.postCode === "string" ? city.postCode : undefined,
        address:
          typeof address?.fullAddress === "string"
            ? address.fullAddress
            : undefined,
      });
    }
    officesCache = { at: Date.now(), data: mapped };
    writeDiskCache("offices-bgr", mapped);
    return mapped;
  })().finally(() => {
    officesInflight = null;
  });
  return officesInflight;
}

async function loadCities(): Promise<EcontCityHit[]> {
  if (cacheValid(citiesCache) && citiesCache) return citiesCache.data;
  const disk = readDiskCache<EcontCityHit[]>("cities-bgr");
  if (disk) {
    citiesCache = disk;
    return disk.data;
  }
  if (citiesInflight) return citiesInflight;
  citiesInflight = (async () => {
    const data = await econtNomenclature(
      "Nomenclatures/NomenclaturesService.getCities.json",
      { countryCode: "BGR" },
    );
    const list = asRecord(data)?.cities;
    const cities = Array.isArray(list) ? list : [];
    const mapped: EcontCityHit[] = [];
    for (const item of cities) {
      const city = asRecord(item);
      if (!city) continue;
      const id = typeof city.id === "number" ? city.id : Number(city.id);
      const name = typeof city.name === "string" ? city.name : "";
      const postCode = typeof city.postCode === "string" ? city.postCode : "";
      if (!Number.isFinite(id) || !name) continue;
      mapped.push({
        id,
        name,
        postCode,
        regionName:
          typeof city.regionName === "string" ? city.regionName : undefined,
      });
    }
    citiesCache = { at: Date.now(), data: mapped };
    writeDiskCache("cities-bgr", mapped);
    return mapped;
  })().finally(() => {
    citiesInflight = null;
  });
  return citiesInflight;
}

function normalizeQuery(q: string) {
  return q.trim().toLowerCase();
}

function rankMatch(name: string, query: string) {
  const n = name.toLowerCase();
  if (n === query) return 0;
  if (n.startsWith(query)) return 1;
  return 2;
}

export async function searchEcontOffices(
  q: string,
  limit = 25,
): Promise<EcontOfficeHit[]> {
  const query = normalizeQuery(q);
  if (query.length < 2) return [];
  const offices = await loadOffices();
  return offices
    .filter((office) => {
      const hay = [office.name, office.city, office.code, office.address ?? ""]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    })
    .sort((a, b) => {
      const byName = rankMatch(a.name, query) - rankMatch(b.name, query);
      if (byName !== 0) return byName;
      return rankMatch(a.city, query) - rankMatch(b.city, query);
    })
    .slice(0, limit);
}

export async function searchEcontCities(
  q: string,
  limit = 25,
): Promise<EcontCityHit[]> {
  const query = normalizeQuery(q);
  if (query.length < 2) return [];
  const cities = await loadCities();
  return cities
    .filter((city) => {
      const hay = [city.name, city.postCode, city.regionName ?? ""]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    })
    .sort((a, b) => rankMatch(a.name, query) - rankMatch(b.name, query))
    .slice(0, limit);
}

type CreateLabelOrder = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  paymentMethod: string;
  totalAmount: number;
  shippingDetails: unknown;
  items?: Array<{ title: string; quantity?: number; unitPrice?: number }>;
};

function customerInfo(order: CreateLabelOrder, details: EcontShippingDetails) {
  const info: Record<string, unknown> = {
    name: order.customerName,
    face: order.customerName,
    phone: order.customerPhone,
    email: order.customerEmail ?? "",
    countryCode: "BGR",
  };
  if (details.kind === "office") {
    info.officeCode = details.officeCode;
    if (details.city) info.cityName = details.city;
    if (details.postCode) info.postCode = details.postCode;
  } else {
    info.cityName = details.city;
    if (details.postCode) info.postCode = details.postCode;
    info.address = `ул. ${details.street} № ${details.num}`;
  }
  return info;
}

function stringifyId(value: unknown) {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function extractShipment(data: unknown) {
  const root = asRecord(data);
  const nested = asRecord(root?.label) ?? asRecord(root?.order) ?? root;
  const shipmentNumber =
    stringifyId(nested?.shipmentNumber) || stringifyId(root?.shipmentNumber);
  const pdfURL =
    stringifyId(nested?.pdfURL) ||
    stringifyId(nested?.pdfUrl) ||
    stringifyId(root?.pdfURL) ||
    stringifyId(root?.pdfUrl);
  return { shipmentNumber, pdfURL: pdfURL || null, id: nested?.id ?? root?.id };
}

export async function createEcontLabel(order: CreateLabelOrder) {
  if (!isEcontConfigured()) {
    throw new EcontApiError(econtConfigError(), 503);
  }

  const details = parseOrderShippingDetails(order.shippingDetails);
  if (!details) {
    throw new EcontApiError(
      "Липсват структурирани данни за Еконт (офис или град/улица/номер). Старите свободни адреси не могат да се пратят автоматично.",
      400,
    );
  }

  const weight = Number(process.env.ECONT_DEFAULT_WEIGHT_KG ?? "1") || 1;
  const description =
    order.items
      ?.map((item) => item.title)
      .filter(Boolean)
      .slice(0, 3)
      .join(", ") || "Лазерни изделия от шперплат";

  const items = (order.items ?? []).map((item) => {
    const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;
    const unit = Number(item.unitPrice ?? 0);
    return {
      name: item.title,
      count: quantity,
      hideCount: 1,
      totalPrice: Math.round(unit * quantity * 100) / 100,
      totalWeight: weight,
    };
  });

  if (items.length === 0) {
    items.push({
      name: description,
      count: 1,
      hideCount: 1,
      totalPrice: order.totalAmount,
      totalWeight: weight,
    });
  } else if (items.length > 1) {
    const perItem = weight / items.length;
    for (const item of items) item.totalWeight = perItem;
  }

  const payload = {
    orderNumber: order.id,
    status: "",
    orderTime: "",
    orderSum: order.totalAmount,
    cod: order.paymentMethod === "CASH_ON_DELIVERY",
    currency: "EUR",
    shipmentDescription: description.slice(0, 180),
    shipmentNumber: "",
    customerInfo: customerInfo(order, details),
    items,
  };

  const updated = await deliveryPost(
    "OrdersService.updateOrder.json",
    payload,
  );
  let created = extractShipment(updated);

  if (!created.shipmentNumber) {
    const awbBody =
      created.id != null && created.id !== ""
        ? { id: created.id, orderNumber: order.id }
        : payload;
    const awb = await deliveryPost("OrdersService.createAWB.json", awbBody);
    created = extractShipment(awb);
  }

  if (!created.shipmentNumber) {
    throw new EcontApiError(
      "Еконт не върна номер на товарителница. Проверете данните в delivery.econt.com и опитайте отново.",
      502,
    );
  }

  return { shipmentNumber: created.shipmentNumber, pdfURL: created.pdfURL };
}

export function econtTrackingUrl(shipmentNumber: string) {
  return `https://www.econt.com/tracking/${encodeURIComponent(shipmentNumber)}`;
}

export async function getEcontShipmentStatus(shipmentNumber: string) {
  const data = await deliveryPost("OrdersService.getOrder.json", {
    shipmentNumber,
  });
  const root = asRecord(data);
  const nested = asRecord(root?.order) ?? asRecord(root?.label) ?? root;
  const status =
    stringifyId(nested?.shipmentStatus) ||
    stringifyId(nested?.status) ||
    stringifyId(root?.status);
  const pdfURL =
    stringifyId(nested?.pdfURL) ||
    stringifyId(nested?.pdfUrl) ||
    stringifyId(root?.pdfURL);
  return {
    shipmentNumber:
      stringifyId(nested?.shipmentNumber) || shipmentNumber,
    status: status || "Няма статус от Еконт",
    pdfURL: pdfURL || null,
    trackingUrl: econtTrackingUrl(shipmentNumber),
  };
}
