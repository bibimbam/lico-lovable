import { createServerFn } from "@tanstack/react-start";

type Msg = { role: "user" | "assistant" | "system"; content: string };

export const askSolar = createServerFn({ method: "POST" })
  .inputValidator((data: { messages: Msg[]; system?: string }) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.UPSTAGE_API_KEY;
    if (!apiKey) {
      throw new Error("UPSTAGE_API_KEY is not configured");
    }

    const messages: Msg[] = [];
    if (data.system) messages.push({ role: "system", content: data.system });
    messages.push(...data.messages);

    const res = await fetch("https://api.upstage.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "solar-pro2",
        messages,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Upstage API error ${res.status}: ${errText}`);
    }

    const json = await res.json();
    const content: string =
      json?.choices?.[0]?.message?.content ?? "응답을 받지 못했어요.";
    return { content };
  });
