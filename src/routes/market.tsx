import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { MarketPage } from "@/components/market-page";

export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [
      { title: "리코 — 학급 마켓" },
      { name: "description", content: "학생들이 L로 특별 권한과 보상을 구매할 수 있는 우리 반 마켓." },
      { property: "og:title", content: "리코 — 학급 마켓" },
      { property: "og:description", content: "학생들이 L로 특별 권한과 보상을 구매할 수 있는 우리 반 마켓." },
    ],
  }),
  component: () => (
    <AppShell>
      <MarketPage />
    </AppShell>
  ),
});
