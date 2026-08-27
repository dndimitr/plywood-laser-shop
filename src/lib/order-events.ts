import { prisma } from "@/lib/db";

export async function logOrderEvent(input: {
  orderId: string;
  type: string;
  message: string;
  actorEmail?: string | null;
  payload?: unknown;
}) {
  try {
    await prisma.orderEvent.create({
      data: {
        orderId: input.orderId,
        type: input.type,
        message: input.message,
        actorEmail: input.actorEmail ?? null,
        payload: input.payload ?? undefined,
      },
    });
  } catch (err) {
    console.error("[order-event]", err);
  }
}
