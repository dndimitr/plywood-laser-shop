import { NextResponse } from "next/server";
import { quoteRequestSchema } from "@/lib/validators";
import { sendQuoteRequestEmails } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = quoteRequestSchema.safeParse(body);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const first =
      flat.formErrors[0] ||
      Object.values(flat.fieldErrors).flat()[0] ||
      "Невалидни данни";
    return NextResponse.json({ error: first }, { status: 400 });
  }

  try {
    await sendQuoteRequestEmails(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[quote-request]", err);
    return NextResponse.json(
      { error: "Грешка при изпращане — опитайте по-късно или се обадете" },
      { status: 500 },
    );
  }
}
