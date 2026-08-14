import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { getDataDir } from "@/lib/local-store";

export type ShippingFees = {
  ECONT: number;
  SPEEDY: number;
  PICKUP: number;
};

const SETTINGS_FILE = "shop-settings.json";

function defaults(): ShippingFees {
  return {
    ECONT: Number(process.env.SHIPPING_FEE_ECONT) || 6.9,
    SPEEDY: Number(process.env.SHIPPING_FEE_SPEEDY) || 7.5,
    PICKUP: Number(process.env.SHIPPING_FEE_PICKUP) || 0,
  };
}

function settingsPath() {
  return path.join(getDataDir(), SETTINGS_FILE);
}

export function getShippingFees(): ShippingFees {
  const base = defaults();
  const file = settingsPath();
  if (!existsSync(file)) return base;
  try {
    const raw = JSON.parse(readFileSync(file, "utf8")) as {
      shippingFees?: Partial<ShippingFees>;
    };
    return {
      ECONT: Number(raw.shippingFees?.ECONT ?? base.ECONT),
      SPEEDY: Number(raw.shippingFees?.SPEEDY ?? base.SPEEDY),
      PICKUP: Number(raw.shippingFees?.PICKUP ?? base.PICKUP),
    };
  } catch {
    return base;
  }
}

export function setShippingFees(fees: ShippingFees) {
  const dir = getDataDir();
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const next = {
    shippingFees: {
      ECONT: Number(fees.ECONT),
      SPEEDY: Number(fees.SPEEDY),
      PICKUP: Number(fees.PICKUP),
    },
    updatedAt: new Date().toISOString(),
  };
  writeFileSync(settingsPath(), JSON.stringify(next, null, 2), "utf8");
}

export function shippingFeeFor(courier: string) {
  const fees = getShippingFees();
  if (courier === "ECONT" || courier === "SPEEDY" || courier === "PICKUP") {
    return fees[courier];
  }
  return fees.ECONT;
}

export function getCourierOptions() {
  const fees = getShippingFees();
  return [
    { id: "ECONT" as const, label: "Еконт", fee: fees.ECONT },
    { id: "SPEEDY" as const, label: "Speedy", fee: fees.SPEEDY },
    { id: "PICKUP" as const, label: "Лично получаване", fee: fees.PICKUP },
  ];
}
