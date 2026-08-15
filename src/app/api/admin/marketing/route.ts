import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getMarketingSettingsForAdmin,
  setMarketingSettings,
} from "@/lib/shop-settings";
import { marketingSettingsSchema } from "@/lib/validators";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(getMarketingSettingsForAdmin());
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = marketingSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  setMarketingSettings({
    gaMeasurementId: parsed.data.gaMeasurementId ?? "",
    googleAdsId: parsed.data.googleAdsId ?? "",
    googleAdsConversionLabel: parsed.data.googleAdsConversionLabel ?? "",
    gtmId: parsed.data.gtmId ?? "",
    googleSiteVerification: parsed.data.googleSiteVerification ?? "",
    metaPixelId: parsed.data.metaPixelId ?? "",
    facebookPageUrl: parsed.data.facebookPageUrl ?? "",
    facebookShareEnabled: parsed.data.facebookShareEnabled ?? true,
  });

  return NextResponse.json(getMarketingSettingsForAdmin());
}
