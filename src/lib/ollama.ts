import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/** Ollama Cloud by default; override with OLLAMA_BASE_URL for a local server. */
export function getOllamaProvider() {
  const apiKey = process.env.OLLAMA_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OLLAMA_API_KEY is not set");
  }

  const baseURL = (
    process.env.OLLAMA_BASE_URL?.trim() || "https://ollama.com/v1"
  ).replace(/\/$/, "");

  return createOpenAICompatible({
    name: "ollama",
    baseURL,
    apiKey,
  });
}

export function getChatModelId() {
  return process.env.CHAT_MODEL?.trim() || "gemma4:31b";
}
