import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Dashboard } from "@/components/dashboard";
import { StudentManagement } from "@/components/student-management";
import { JobManagement } from "@/components/job-management";
import { EconomyGenerator } from "@/components/economy-generator";
import { useMode } from "@/components/mode-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "리코 — 우리 반 경제" },
      { name: "description", content: "리코(LICO)는 초등 교실의 경제 활동을 AI로 자동 설계·운영하는 에듀테크 플랫폼입니다." },
      { property: "og:title", content: "리코 (LICO)" },
      { property: "og:description", content: "AI 기반 초등 교실 경제 운영 자동화 플랫폼" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <Body />
    </AppShell>
  );
}

function Body() {
  const { mode } = useMode();
  if (mode === "student") return <Dashboard />;
  return (
    <div className="space-y-10">
      <Dashboard />
      <div className="border-t border-dashed border-border pt-8 space-y-10">
        <StudentManagement />
        <JobManagement />
        <EconomyGenerator />
      </div>
    </div>
  );
}
