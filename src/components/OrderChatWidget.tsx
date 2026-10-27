"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type SearchProduct = {
  id: string;
  slug: string;
  name: string;
  basePrice: number;
  href: string;
  categoryLabel?: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function asSearchProducts(output: unknown): SearchProduct[] {
  if (!Array.isArray(output)) return [];
  return output.filter((p): p is SearchProduct => {
    if (!isRecord(p)) return false;
    return (
      typeof p.id === "string" &&
      typeof p.slug === "string" &&
      typeof p.name === "string" &&
      typeof p.href === "string" &&
      typeof p.basePrice === "number"
    );
  });
}

function cartAddedOk(output: unknown): boolean {
  return isRecord(output) && output.ok === true;
}

/** Light markdown for chat bubbles — Gemma often emits **bold**. */
function ChatText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    nodes.push(<strong key={`b-${key++}`}>{m[1]}</strong>);
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <p className="order-chat-text">{nodes}</p>;
}

export function OrderChatWidget() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport,
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, open, status]);

  useEffect(() => {
    for (const message of messages) {
      if (message.role !== "assistant") continue;
      for (const part of message.parts) {
        if (
          part.type === "tool-addToCart" &&
          part.state === "output-available" &&
          cartAddedOk(part.output)
        ) {
          router.refresh();
        }
      }
    }
  }, [messages, router]);

  const showCheckoutCta = messages.some((message) =>
    message.parts.some(
      (part) =>
        part.type === "tool-addToCart" &&
        part.state === "output-available" &&
        cartAddedOk(part.output),
    ),
  );

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    void sendMessage({ text: trimmed });
    setInput("");
  }

  return (
    <div className={`order-chat${open ? " is-open" : ""}`}>
      {open ? (
        <section
          className="order-chat-panel"
          aria-label="Асистент за поръчка"
        >
          <header className="order-chat-header">
            <div>
              <p className="order-chat-eyebrow">Studio Breza</p>
              <h2 className="order-chat-title">Асистент за поръчка</h2>
            </div>
            <button
              type="button"
              className="order-chat-icon-btn"
              aria-label="Затвори чата"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </header>

          <div className="order-chat-messages" ref={listRef}>
            {messages.length === 0 ? (
              <div className="order-chat-bubble order-chat-bubble-assistant">
                <p>
                  Здравейте! Кажете повода или модела — напр. „подарък за
                  кръщене с име Ива“ — и ще предложа продукти от каталога.
                  След избор ги добавяме в количката; куриер и плащане са на
                  касата.
                </p>
                <div className="order-chat-suggestions">
                  {[
                    "Подарък за кръщене с име",
                    "Табела за новородено",
                    "Какво имате за учител?",
                    "Сватбена табела с имена",
                    "Топер за рожден ден",
                    "Подарък за годишнина",
                    "Коледен орнамент с име",
                    "Адресна табела за нов дом",
                    "Ключодържател с име",
                    "Хелоуин декорации",
                    "Монтесори за дете",
                    "Подарък за 8 март",
                  ].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="order-chat-chip"
                      onClick={() => submit(s)}
                      disabled={busy}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`order-chat-bubble order-chat-bubble-${message.role}`}
              >
                {message.parts.map((part, i) => {
                  if (part.type === "text" && part.text) {
                    return (
                      <ChatText key={`${message.id}-t-${i}`} text={part.text} />
                    );
                  }

                  if (part.type === "tool-searchProducts") {
                    if (
                      part.state === "input-streaming" ||
                      part.state === "input-available"
                    ) {
                      return (
                        <p
                          key={`${message.id}-sp-${i}`}
                          className="order-chat-tool-status"
                        >
                          Търся в каталога…
                        </p>
                      );
                    }
                    if (part.state === "output-available") {
                      const products = asSearchProducts(part.output);
                      if (!products.length) {
                        return (
                          <p
                            key={`${message.id}-sp-${i}`}
                            className="order-chat-tool-status"
                          >
                            Няма намерени модели за тази заявка.
                          </p>
                        );
                      }
                      return (
                        <ul
                          key={`${message.id}-sp-${i}`}
                          className="order-chat-products"
                        >
                          {products.map((p) => (
                            <li key={p.id}>
                              <Link href={p.href} className="order-chat-product">
                                <span className="order-chat-product-name">
                                  {p.name}
                                </span>
                                <span className="order-chat-product-meta">
                                  {p.categoryLabel
                                    ? `${p.categoryLabel} · `
                                    : ""}
                                  {p.basePrice.toFixed(2)} €
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      );
                    }
                  }

                  if (
                    part.type === "tool-addToCart" &&
                    part.state === "output-available" &&
                    cartAddedOk(part.output)
                  ) {
                    return (
                      <p
                        key={`${message.id}-atc-${i}`}
                        className="order-chat-tool-status is-ok"
                      >
                        Добавено в количката.
                      </p>
                    );
                  }

                  return null;
                })}
              </div>
            ))}

            {busy ? (
              <p className="order-chat-tool-status">Пиша…</p>
            ) : null}

            {error ? (
              <p className="order-chat-error" role="alert">
                {error.message ||
                  "Възникна грешка. Опитайте отново или поръчайте през каталога."}
              </p>
            ) : null}
          </div>

          {showCheckoutCta ? (
            <div className="order-chat-checkout-bar">
              <Link href="/checkout" className="btn btn-primary order-chat-checkout">
                Към касата
              </Link>
            </div>
          ) : null}

          <form
            className="order-chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
          >
            <label className="sr-only" htmlFor="order-chat-input">
              Съобщение
            </label>
            <input
              id="order-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Напишете повод, име или въпрос…"
              disabled={busy}
              autoComplete="off"
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={busy || !input.trim()}
            >
              Изпрати
            </button>
          </form>

          {messages.length > 0 ? (
            <button
              type="button"
              className="order-chat-reset"
              onClick={() => setMessages([])}
              disabled={busy}
            >
              Нова заявка
            </button>
          ) : null}
        </section>
      ) : null}

      {!open ? (
        <button
          type="button"
          className="order-chat-fab"
          aria-expanded={false}
          aria-label="Отвори чат за поръчка"
          onClick={() => setOpen(true)}
        >
          Поръчай с чат
        </button>
      ) : null}
    </div>
  );
}
