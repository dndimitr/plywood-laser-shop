import { NextResponse } from "next/server";
import { EcontApiError, searchEcontCities } from "@/lib/econt";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  if (q.trim().length < 2) {
    return NextResponse.json({ cities: [] });
  }

  try {
    const cities = await searchEcontCities(q);
    return NextResponse.json(
      { cities },
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
        : "Неуспешно зареждане на градове на Еконт";
    const status = err instanceof EcontApiError ? err.status : 502;
    console.error("[econt] cities", err);
    return NextResponse.json({ error: message, cities: [] }, { status });
  }
}
