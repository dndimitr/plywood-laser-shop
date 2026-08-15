import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ЛазерШперплат — лазерно изрязване и гравиране на шперплат";
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
            fontSize: 28,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            opacity: 0.85,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Лазер · Шперплат · България
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            ЛазерШперплат
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
            Лазерно изрязване и гравиране на шперплат — готови модели и поръчка
            по ваш файл
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
