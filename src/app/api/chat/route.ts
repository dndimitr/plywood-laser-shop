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
import { FREE_SHIPPING_MIN_EUR } from "@/lib/shop-config";
import { addTemplateCartSchema } from "@/lib/validators";

export const maxDuration = 60;

const SYSTEM_PROMPT = `Ти си продуктов асистент на Studio Breza (studiobreza.eu) — каталог с персонализирани подаръци от брезов шперплат с лазерно гравиране.

Език: винаги български, кратък и учтив.
Формат: само чист текст — без Markdown (**болд**, списъци с -, # заглавия).

ОБХВАТ — само продукти от каталога:
- търсене и сравнение на модели (повод, тема, име на продукт);
- опции, размери, цена и текст за гравиране;
- добавяне в количката след изрично „да“/потвърждение;
- кратки факти, нужни за избор на продукт: материал (брезов шперплат), срок на изработка 2–5 раб. дни, безплатна доставка над ${FREE_SHIPPING_MIN_EUR} €.

ИЗВЪН ОБХВАТ — откажи с 1–2 изречения и върни към каталога. Не отговаряй на:
- общи въпроси, новини, политика, здраве, рецепти, домашни, код, преводи, шеги;
- съвети без връзка с конкретен продукт от магазина;
- въпроси за конкуренти или други сайтове;
- плащане/куриер в детайл извън „на касата“ — насочи към /checkout;
- собствен дизайн/файл — насочи към /custom.

Задачи при продуктов въпрос:
1) Ползвай searchProducts / getProduct — никога не измисляй продукти, цени или наличност.
2) След searchProducts: НЕ изброявай продукти, имена или цени в текста — интерфейсът ги показва като бутони. Пиши най-много едно кратко изречение (напр. „Изберете модел или кажете име за гравиране.“) или изобщо без текст.
3) Уточни гравиране и опция; преди addToCart покажи резюме и изчакай потвърждение.
4) След addToCart насочи към /checkout („Към касата“).

Ако въпросът не е за продуктите: „Мога да помогна само с моделите от каталога — кажете повод или име на продукт.“`;

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
