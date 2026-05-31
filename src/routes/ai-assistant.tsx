import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { AiAssistantPage } from "@/components/ai-assistant-page";

export const Route = createFileRoute("/ai-assistant")({
  head: () => ({
    meta: [
      { title: "리코 — AI 어시스턴트" },
      { name: "description", content: "교실 경제 운영을 함께 고민해주는 AI 코티칭 어시스턴트." },
      { property: "og:title", content: "리코 — AI 어시스턴트" },
      { property: "og:description", content: "교실 경제 운영을 함께 고민해주는 AI 코티칭 어시스턴트." },
    ],
  }),
  component: () => (
    <AppShell>
      <AiAssistantPage />
    </AppShell>
  ),
});
