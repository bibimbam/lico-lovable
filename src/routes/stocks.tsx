import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { StocksPage } from "@/components/stocks-page";

export const Route = createFileRoute("/stocks")({
  head: () => ({
    meta: [
      { title: "리코 — 주식 시장" },
      { name: "description", content: "실제 한국 경제 흐름을 교육용으로 단순화한 우리 반 주식 시장." },
      { property: "og:title", content: "리코 — 주식 시장" },
      { property: "og:description", content: "실제 한국 경제 흐름을 교육용으로 단순화한 우리 반 주식 시장." },
    ],
  }),
  component: () => (
    <AppShell>
      <StocksPage />
    </AppShell>
  ),
});
