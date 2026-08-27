import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-session";
import { prisma } from "@/lib/db";
import { productBulkSchema } from "@/lib/validators";

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = productBulkSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Невалидни данни" }, { status: 400 });
  }
  const { ids, ...patch } = parsed.data;
  const data: Record<string, unknown> = {};
  if (patch.category) data.category = patch.category;
  if (patch.availability) data.availability = patch.availability;
  if (patch.basePrice != null) data.basePrice = patch.basePrice;
  if (patch.active != null) data.active = patch.active;
  if (!Object.keys(data).length) {
    return NextResponse.json({ error: "Няма полета за промяна" }, { status: 400 });
  }
  const result = await prisma.product.updateMany({
    where: { id: { in: ids } },
    data,
  });
  return NextResponse.json({ count: result.count });
}
