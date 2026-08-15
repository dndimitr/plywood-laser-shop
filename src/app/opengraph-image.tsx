import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Studio Breza — персонализирани подаръци и украси";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default Open Graph / social share image */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(145deg, #1c1914 0%, #3d3428 48%, #2a231c 100%)",
          color: "#f7f1e8",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            opacity: 0.8,
            fontFamily: "system-ui, sans-serif",
            color: "#a8c0b0",
          }}
        >
          Studio · България
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: 78,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
            }}
          >
            Studio Breza
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              lineHeight: 1.35,
              maxWidth: 900,
              opacity: 0.92,
              fontFamily: "system-ui, sans-serif",
              fontWeight: 400,
            }}
          >
            Персонализирани подаръци и украси — с име, дата или послание за
            всеки повод
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 24,
            fontFamily: "system-ui, sans-serif",
            opacity: 0.75,
          }}
        >
          Доставка с Еконт и Speedy
        </div>
      </div>
    ),
    { ...size },
  );
}
