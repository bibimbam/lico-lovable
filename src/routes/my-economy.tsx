import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { MyEconomy } from "@/components/my-economy";

export const Route = createFileRoute("/my-economy")({
  head: () => ({
    meta: [
      { title: "리코 — 나의 경제" },
      { name: "description", content: "학생의 통장, 직업, 보유 아이템, 세금 현황을 한눈에 보는 나의 경제 페이지." },
      { property: "og:title", content: "리코 — 나의 경제" },
      { property: "og:description", content: "학생의 통장, 직업, 보유 아이템, 세금 현황을 한눈에 보는 나의 경제 페이지." },
    ],
  }),
  component: () => (
    <AppShell>
      <MyEconomy />
    </AppShell>
  ),
});
