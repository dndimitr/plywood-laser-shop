import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getShippingFees,
  setShippingFees,
} from "@/lib/shipping-settings";
import { shippingFeesSchema } from "@/lib/validators";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(getShippingFees());
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = shippingFeesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  setShippingFees(parsed.data);
  return NextResponse.json(getShippingFees());
}
