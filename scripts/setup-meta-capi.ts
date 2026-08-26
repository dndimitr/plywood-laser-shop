/**
 * Local smoke test for Meta CAPI + Dataset Quality API.
 * Usage: META_CAPI_ACCESS_TOKEN=EAA… npx tsx scripts/setup-meta-capi.ts
 */
import {
  fetchMetaDatasetQuality,
  isMetaCapiConfigured,
  newMetaEventId,
  sendMetaCapiEvent,
} from "../src/lib/meta-capi";
import { getMarketingSettings } from "../src/lib/shop-settings";

async function main() {
  const token = process.env.META_CAPI_ACCESS_TOKEN?.trim() || "";
  if (!token) {
    console.error("META_CAPI_ACCESS_TOKEN missing");
    process.exit(1);
  }

  const m = getMarketingSettings();
  console.log(
    JSON.stringify(
      {
        configured: isMetaCapiConfigured(),
        pixel: m.metaPixelId,
        tokenFromEnv: Boolean(token),
        tokenLen: token.length,
      },
      null,
      2,
    ),
  );

  const pageView = await sendMetaCapiEvent({
    eventName: "PageView",
    eventId: newMetaEventId("test_pv"),
    eventSourceUrl: "https://studiobreza.eu/",
    user: {
      clientIp: "1.2.3.4",
      userAgent: "CursorCapiSetup/1.0",
      fbp: "fb.1.1770000000.1",
    },
  });
  console.log("capi PageView:", pageView);

  const viewContent = await sendMetaCapiEvent({
    eventName: "ViewContent",
    eventId: newMetaEventId("test_vc"),
    eventSourceUrl: "https://studiobreza.eu/products/guestbook-darvo",
    user: {
      clientIp: "1.2.3.4",
      userAgent: "CursorCapiSetup/1.0",
      fbp: "fb.1.1770000000.1",
    },
    customData: {
      value: 12.1,
      currency: "EUR",
      content_ids: ["guestbook-darvo"],
      content_name: "Guestbook test",
      content_type: "product",
    },
  });
  console.log("capi ViewContent:", viewContent);

  const dq = await fetchMetaDatasetQuality();
  console.log("dataset_quality:", JSON.stringify(dq, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
