import type { Metadata } from "next";
import { CustomUploadForm } from "@/components/CustomUploadForm";
import { QuoteRequestForm } from "@/components/QuoteRequestForm";

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
            <li>
              За големи количества или фирмено лого —{" "}
              <a href="#oferta-custom">заявка за оферта</a>
            </li>
          </ul>
        </div>
        <CustomUploadForm />
      </div>

      <section id="oferta-custom" className="custom-quote-section">
        <QuoteRequestForm
          defaultSource="custom"
          title="Заявка за оферта по файл"
          lead="Ако количеството е голямо или макетът е сложен — опишете нуждите и ще подготвим оферта."
        />
      </section>
    </div>
  );
}
