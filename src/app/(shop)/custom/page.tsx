import type { Metadata } from "next";
import { CustomUploadForm } from "@/components/CustomUploadForm";

export const metadata: Metadata = {
  title: "Поръчка по файл",
  description:
    "Качете SVG, PDF, PNG или JPG и получете ориентировъчна цена за лазерна изработка от шперплат.",
};

export default function CustomPage() {
  return (
    <div className="container custom-page">
      <div className="custom-grid">
        <div>
          <h1 className="page-title">Поръчка по ваш файл</h1>
          <p className="section-lead">
            Качете макета, посочете размери и дебелина на шперплата.
            Калкулаторът дава ориентировъчна цена преди добавяне в количката.
          </p>
          <ul className="muted" style={{ paddingLeft: "1.1rem", lineHeight: 1.7 }}>
            <li>Формати: SVG, PDF, PNG, JPG · до 8 MB</li>
            <li>За изрязване: затворен векторен контур (предпочтително SVG/PDF)</li>
            <li>След поръчка потвърждаваме макета и срока за изработка</li>
          </ul>
        </div>
        <CustomUploadForm />
      </div>
    </div>
  );
}
