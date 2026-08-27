"use client";

export function PrintButton() {
  return (
    <p className="no-print">
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => window.print()}
      >
        Печат
      </button>
    </p>
  );
}
