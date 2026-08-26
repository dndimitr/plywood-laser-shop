import { NextResponse } from "next/server";
import { toCatalogContentIds } from "@/lib/meta-catalog-ids";
import {
  clientIpFromRequest,
  sendMetaCapiEvent,
  type MetaCapiEventName,
} from "@/lib/meta-capi";

type Body = {
  eventName: MetaCapiEventName;
  eventId: string;
  eventSourceUrl?: string;
  value?: number;
  currency?: string;
  contentIds?: string[];
  contentName?: string;
  numItems?: number;
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  orderId?: string;
  email?: string;
  phone?: string;
  fbp?: string;
  fbc?: string;
  consent?: boolean;
};

const ALLOWED: MetaCapiEventName[] = [
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
  "Purchase",
  "PageView",
];

/**
 * Browser → server bridge for Meta CAPI (dedup via event_id with Pixel).
 * Requires marketing consent from the client.
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.consent) {
    return NextResponse.json({ ok: true, skipped: "no_consent" });
  }
  if (!body.eventId || !ALLOWED.includes(body.eventName)) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const contentIds = toCatalogContentIds(body.contentIds ?? []);
  const contents = (body.contents ?? [])
    .map((c) => ({
      ...c,
      id: typeof c.id === "string" ? c.id.trim() : "",
    }))
    .filter((c) => c.id && toCatalogContentIds([c.id]).length > 0);

  const result = await sendMetaCapiEvent({
    eventName: body.eventName,
    eventId: body.eventId,
    eventSourceUrl: body.eventSourceUrl,
    user: {
      email: body.email,
      phone: body.phone,
      clientIp: clientIpFromRequest(request),
      userAgent: request.headers.get("user-agent"),
      fbp: body.fbp,
      fbc: body.fbc,
    },
    customData: {
      value: body.value,
      currency: body.currency ?? "EUR",
      ...(contentIds.length ? { content_ids: contentIds } : {}),
      content_name: body.contentName,
      content_type: "product",
      ...(contents.length ? { contents } : {}),
      num_items: body.numItems,
      order_id: body.orderId,
    },
  });

  return NextResponse.json(result);
}
