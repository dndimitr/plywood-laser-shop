import type { Metadata } from "next";
import { CustomUploadForm } from "@/components/CustomUploadForm";
import { JsonLd } from "@/components/JsonLd";
import { MACHINE_BED_MAX_CM } from "@/lib/shop-config";
import { breadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";
import { getMarketingSettings } from "@/lib/shop-settings";

export const metadata: Metadata = buildPageMetadata({
  title: "Поръчка по ваш дизайн",
  description:
    "Качете SVG, PDF, PNG или JPG и получете ориентировъчна цена за персонализиран подарък или украса по ваш дизайн. Без регистрация.",
  path: "/custom",
});

export default function CustomPage() {
  const marketing = getMarketingSettings();

  return (
    <div className="container custom-page">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Начало", path: "/" },
          { name: "Поръчка по дизайн", path: "/custom" },
        ])}
      />
      <div className="custom-grid">
        <div>
          <h1 className="page-title">Поръчка по ваш дизайн</h1>
          <p className="section-lead">
            Качете макета, посочете размери и дебелина. Калкулаторът дава
            ориентировъчна цена преди добавяне в количката.
          </p>
          <ul className="muted" style={{ paddingLeft: "1.1rem", lineHeight: 1.7 }}>
            <li>Формати: SVG, PDF, PNG, JPG · до 8 MB</li>
            <li>
              Максимална работна площ: {MACHINE_BED_MAX_CM}×{MACHINE_BED_MAX_CM}{" "}
              см
            </li>
            <li>За изрязване: затворен векторен контур (предпочтително SVG/PDF)</li>
            <li>След поръчка потвърждаваме макета и срока за изработка</li>
          </ul>
        </div>
        <CustomUploadForm gaMeasurementId={marketing.gaMeasurementId || null} />
      </div>
    </div>
  );
}
