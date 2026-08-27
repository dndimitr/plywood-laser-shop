import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-session";
import { EcontApiError, getEcontShipmentStatus } from "@/lib/econt";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order?.econtShipmentNumber) {
    return NextResponse.json(
      { error: "Няма товарителница на Еконт" },
      { status: 400 },
    );
  }
  try {
    const status = await getEcontShipmentStatus(order.econtShipmentNumber);
    if (status.trackingUrl && status.trackingUrl !== order.trackingUrl) {
      await prisma.order.update({
        where: { id },
        data: { trackingUrl: status.trackingUrl },
      });
    }
    return NextResponse.json(status);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof EcontApiError
            ? err.message
            : "Еконт не върна статус",
        trackingUrl: `https://www.econt.com/tracking/${order.econtShipmentNumber}`,
      },
      { status: 502 },
    );
  }
}
