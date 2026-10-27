import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { addTemplateToCart } from "@/lib/cart-add-template";
import {
  getCartSummaryForChat,
  getCatalogProduct,
  searchCatalogProducts,
} from "@/lib/chat-catalog";
import { chatRateLimitOk } from "@/lib/chat-rate-limit";
import { getChatModelId, getOllamaProvider } from "@/lib/ollama";
import { addTemplateCartSchema } from "@/lib/validators";

export const maxDuration = 60;

const SYSTEM_PROMPT = `Ти си асистент за поръчки в Studio Breza (studiobreza.eu) — онлайн магазин за персонализирани подаръци с лазерно гравиране от брезов шперплат (Варна, доставка в България).

Език: винаги български, кратък и учтив тон.
Формат: само чист текст — без Markdown (**болд**, списъци с -, # заглавия). Номерирай с „1.“ „2.“ ако трябва.

Задачи:
1) Помогни на клиента да избере готов модел от каталога.
2) Уточни текст за гравиране (име, дата, поздрав) и размер/опция.
3) След изрично потвърждение от клиента добави в количката с addToCart.
4) След успешно добавяне насочи към /checkout („Към касата“) за куриер и плащане.

Правила:
- Никога не измисляй продукти, цени или наличност — ползвай само tool резултати.
- Преди addToCart покажи име, опция, цена, текст за гравиране и количество и изчакай „да“/потвърждение.
- Не приемаш качване на файлове и не завършваш плащане в чата.
- За поръчка по собствен дизайн насочи към /custom.
- Извън магазина (офтоп) откажи учтиво и върни разговора към подаръци/каталог.
- Плащане: наложен платеж, банков превод или карта (ако е активна). Доставка: Еконт/Speedy/лично във Варна; безплатна куриерска над 35 €. Изработка обикновено 2–5 работни дни.`;

function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!chatRateLimitOk(ip)) {
    return Response.json(
      { error: "Твърде много заявки. Опитайте пак след минута." },
      { status: 429 },
    );
  }

  let messages: UIMessage[];
  try {
    const body = await req.json();
    messages = body.messages;
    if (!Array.isArray(messages)) {
      return Response.json({ error: "Невалидни съобщения" }, { status: 400 });
    }
  } catch {
    return Response.json({ error: "Невалидна заявка" }, { status: 400 });
  }

  let result;
  try {
    if (!process.env.OLLAMA_API_KEY?.trim()) {
      return Response.json(
        {
          error:
            "Чатът временно не е настроен. Липсва OLLAMA_API_KEY. Можете да поръчате през каталога.",
        },
        { status: 503 },
      );
    }

    const ollama = getOllamaProvider();
    result = streamText({
    model: ollama(getChatModelId()),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(8),
    tools: {
      searchProducts: tool({
        description:
          "Търси продукти в каталога по ключова дума и/или категория (напр. кръщене, сватба, училище).",
        inputSchema: z.object({
          query: z
            .string()
            .describe("Свободен текст: повод, име на продукт, материал…"),
          category: z
            .string()
            .optional()
            .describe(
              "Опционална категория: baptism, wedding, birthday, school, christmas…",
            ),
          limit: z.number().int().min(1).max(12).optional(),
        }),
        execute: async ({ query, category, limit }) =>
          searchCatalogProducts({ query, category, limit }),
      }),

      getProduct: tool({
        description:
          "Детайли за един продукт по slug или id — опции, размери и цени.",
        inputSchema: z.object({
          slugOrId: z.string().min(1),
        }),
        execute: async ({ slugOrId }) => {
          const product = await getCatalogProduct(slugOrId);
          if (!product) return { error: "Продуктът не е намерен" };
          return product;
        },
      }),

      addToCart: tool({
        description:
          "Добавя готов модел в количката след потвърждение от клиента. Изисква productId, optionId, engravingText, quantity.",
        inputSchema: z.object({
          productId: z.string().min(1),
          optionId: z.string().min(1),
          engravingText: z.string().max(200).optional().default(""),
          quantity: z.number().int().min(1).max(50).default(1),
          rush: z.boolean().optional(),
        }),
        execute: async (input) => {
          const parsed = addTemplateCartSchema.safeParse({
            productId: input.productId,
            optionId: input.optionId,
            engravingText: input.engravingText ?? "",
            quantity: input.quantity ?? 1,
            rush: input.rush,
          });
          if (!parsed.success) {
            return {
              ok: false,
              error: "Невалидни данни за количката",
            };
          }
          const result = await addTemplateToCart(parsed.data);
          if (!result.ok) {
            return { ok: false, error: result.error };
          }
          const summary = await getCartSummaryForChat();
          return {
            ok: true,
            added: {
              title: result.item.title,
              quantity: result.item.quantity,
              unitPrice: result.item.unitPrice,
              engravingText: result.item.personalization.engravingText ?? "",
              optionLabel: result.item.personalization.optionLabel ?? "",
              href: result.item.productSlug
                ? `/products/${result.item.productSlug}`
                : null,
            },
            cart: summary,
            checkoutUrl: "/checkout",
            message:
              "Добавено в количката. Клиентът трябва да отвори /checkout за куриер и плащане.",
          };
        },
      }),

      getCartSummary: tool({
        description: "Текущо съдържание и сума на количката.",
        inputSchema: z.object({}),
        execute: async () => getCartSummaryForChat(),
      }),

      goToCheckout: tool({
        description:
          "Връща линк към касата. Извикай след успешно добавяне или когато клиентът е готов да плати.",
        inputSchema: z.object({}),
        execute: async () => {
          const cart = await getCartSummaryForChat();
          return {
            checkoutUrl: "/checkout",
            itemCount: cart.itemCount,
            subtotal: cart.subtotal,
            hint:
              cart.itemCount === 0
                ? "Количката е празна — първо добавете продукт."
                : "Отворете /checkout за адрес, куриер и плащане.",
          };
        },
      }),
    },
  });
  } catch (err) {
    console.error("[chat] streamText init failed", err);
    return Response.json(
      {
        error:
          "Чатът временно не е наличен. Проверете OLLAMA_API_KEY / модела или поръчайте през каталога.",
      },
      { status: 503 },
    );
  }

  return result.toUIMessageStreamResponse();
}
