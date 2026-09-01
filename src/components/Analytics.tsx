import Script from "next/script";
import { CONSENT_STORAGE_KEY } from "@/lib/seo-client";
import { getMarketingSettings, hasActiveMarketingScripts } from "@/lib/shop-settings";

/**
 * Google Analytics 4 + Google Ads (gtag) + optional GTM.
 * IDs come from admin Marketing settings (env fallback).
 * Consent Mode v2 defaults stay denied until CookieConsent grants.
 */
export function Analytics() {
  if (!hasActiveMarketingScripts()) return null;

  const { gaMeasurementId, googleAdsId, gtmId, metaPixelId } =
    getMarketingSettings();

  // Prefer a single GTM container when configured
  if (gtmId) {
    return (
      <>
        <ConsentDefaults />
        <Script id="gtm-loader" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `}
        </Script>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        {metaPixelId ? <MetaPixelScript pixelId={metaPixelId} /> : null}
      </>
    );
  }

  const gtagIds = [gaMeasurementId, googleAdsId].filter(Boolean);
  const hasGtag = gtagIds.length > 0;
  if (!hasGtag && !metaPixelId) return null;
  const primaryId = gtagIds[0];

  return (
    <>
      <ConsentDefaults />
      {hasGtag && primaryId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              ${gaMeasurementId ? `gtag('config', '${gaMeasurementId}', { anonymize_ip: true, send_page_view: true });` : ""}
              ${googleAdsId ? `gtag('config', '${googleAdsId}');` : ""}
            `}
          </Script>
        </>
      ) : null}
      {metaPixelId ? <MetaPixelScript pixelId={metaPixelId} /> : null}
    </>
  );
}

function ConsentDefaults() {
  return (
    <Script id="consent-default" strategy="beforeInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('consent', 'default', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          analytics_storage: 'denied',
          functionality_storage: 'granted',
          security_storage: 'granted',
          wait_for_update: 500
        });
        gtag('set', 'ads_data_redaction', true);
        gtag('set', 'url_passthrough', true);
      `}
    </Script>
  );
}

function MetaPixelScript({ pixelId }: { pixelId: string }) {
  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        try {
          fbq('consent', localStorage.getItem('${CONSENT_STORAGE_KEY}') === 'accepted' ? 'grant' : 'revoke');
        } catch (e) {
          fbq('consent', 'revoke');
        }
        fbq('init', '${pixelId}');
      `}
    </Script>
  );
}
