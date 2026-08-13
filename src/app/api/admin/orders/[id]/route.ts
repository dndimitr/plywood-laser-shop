import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const order = await prisma.order.update({
    where: { id },
    data: {
      ...(body.status ? { status: body.status } : {}),
      ...(body.designReview ? { designReview: body.designReview } : {}),
      ...(body.paymentStatus ? { paymentStatus: body.paymentStatus } : {}),
      ...(body.adminNotes !== undefined
        ? { adminNotes: body.adminNotes }
        : {}),
    },
    include: {
      items: { include: { uploadedDesign: true, product: true } },
    },
  });

  return NextResponse.json(order);
}
