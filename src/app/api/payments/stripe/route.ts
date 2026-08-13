import { NextResponse } from "next/server";

/** Stripe Checkout stub — activates when STRIPE_SECRET_KEY is set */
export async function POST(request: Request) {
  const body = await request.json();
  const secret = process.env.STRIPE_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!secret) {
    return NextResponse.json({
      skipped: true,
      message:
        "STRIPE_SECRET_KEY липсва — продължете към success страницата без карта.",
    });
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "bgn",
            unit_amount: Math.round(Number(body.amount) * 100),
            product_data: { name: `Поръчка ${body.orderId}` },
          },
        },
      ],
      success_url: `${appUrl}/order/${body.orderId}/success?t=${encodeURIComponent(body.publicToken)}&paid=1`,
      cancel_url: `${appUrl}/checkout`,
      metadata: { orderId: body.orderId },
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Stripe грешка",
      },
      { status: 500 },
    );
  }
}
