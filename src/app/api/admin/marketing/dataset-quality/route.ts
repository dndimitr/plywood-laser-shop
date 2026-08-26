import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchMetaDatasetQuality, isMetaCapiConfigured } from "@/lib/meta-capi";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isMetaCapiConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        skipped: true,
        error:
          "Липсва Meta Pixel ID или CAPI/Dataset Quality токен (META_CAPI_ACCESS_TOKEN).",
        events: [],
      },
      { status: 400 },
    );
  }

  const result = await fetchMetaDatasetQuality();
  if (!result.ok) {
    return NextResponse.json(result, { status: result.status && result.status >= 400 ? result.status : 502 });
  }
  return NextResponse.json(result);
}
