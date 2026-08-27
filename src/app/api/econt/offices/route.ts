import { NextResponse } from "next/server";
import { EcontApiError, searchEcontOffices } from "@/lib/econt";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  if (q.trim().length < 2) {
    return NextResponse.json({ offices: [] });
  }

  try {
    const offices = await searchEcontOffices(q);
    return NextResponse.json(
      { offices },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        },
      },
    );
  } catch (err) {
    const message =
      err instanceof EcontApiError
        ? err.message
        : "Неуспешно зареждане на офиси на Еконт";
    const status = err instanceof EcontApiError ? err.status : 502;
    console.error("[econt] offices", err);
    return NextResponse.json({ error: message, offices: [] }, { status });
  }
}
