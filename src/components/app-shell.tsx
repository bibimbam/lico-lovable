import { type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Users, ShoppingBag, TrendingUp, Sparkles, GraduationCap, Wallet,
  Settings, Bell, ChevronRight, LogOut, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeProvider, useMode } from "@/components/mode-context";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const teacherNav = [
  { to: "/", label: "우리 반 경제", icon: Users },
  { to: "/market", label: "학급 마켓", icon: ShoppingBag },
  { to: "/stocks", label: "주식 시장", icon: TrendingUp },
  { to: "/ai-assistant", label: "AI 어시스턴트", icon: Sparkles },
];

const studentNav = [
  { to: "/", label: "우리 반 경제", icon: Users },
  { to: "/my-economy", label: "나의 경제", icon: Wallet },
  { to: "/market", label: "학급 마켓", icon: ShoppingBag },
  { to: "/stocks", label: "주식 시장", icon: TrendingUp },
  { to: "/ai-assistant", label: "AI 어시스턴트", icon: Sparkles },
];

const NOTIFICATIONS = [
  { content: "A전자 주가가 12% 상승했습니다.", date: "2025.09.12" },
  { content: "H모빌리티 주가가 8% 하락했습니다.", date: "2025.09.11" },
  { content: "환경 보호 이벤트가 시작되었습니다.", date: "2025.09.10" },
];

const TEACHER_PROFILE = {
  name: "김선생님",
  school: "서울초등학교",
  classInfo: "5학년 2반 (25명)",
  modeLabel: "교사용 모드",
  initial: "김",
};

const STUDENT_PROFILE = {
  name: "김민준",
  school: "서울초등학교",
  classInfo: "5학년 2반 (25명)",
  job: "환경 미화원",
  modeLabel: "학생용 모드",
  initial: "민",
};

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ModeProvider>
      <Shell>{children}</Shell>
    </ModeProvider>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const { mode, setMode } = useMode();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const profile = mode === "teacher" ? TEACHER_PROFILE : STUDENT_PROFILE;

  const handleLogout = () => {
    // Prototype logout placeholder
    alert("로그아웃 되었습니다.");
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <aside className="fixed inset-y-0 left-0 z-20 w-64 border-r border-border bg-sidebar flex flex-col">
        <div className="px-6 py-6 flex items-center gap-2">
          <div className="size-10 rounded-2xl bg-primary grid place-items-center shadow-[0_6px_0_0_oklch(0.55_0.15_240)]">
            <span className="font-display text-xl text-primary-foreground">리</span>
          </div>
          <div>
            <div className="font-display text-2xl leading-none">리코</div>
            <div className="text-[11px] text-muted-foreground tracking-wide">Little Economy</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {(mode === "student" ? studentNav : teacherNav).map((item) => {
            const active = path === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.to}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-[0_4px_0_0_oklch(0.55_0.15_240)]"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="size-4" />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="size-4" />}
              </Link>
            );
          })}
        </nav>

        <button className="m-3 flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
          <Settings className="size-4" /> 설정
        </button>
      </aside>

      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border">
          <div className="flex items-center gap-4 px-8 h-16">
            <div className="inline-flex p-1 bg-muted rounded-full">
              <button
                onClick={() => setMode("teacher")}
                className={cn(
                  "px-4 py-1.5 text-sm font-semibold rounded-full transition-all",
                  mode === "teacher" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"
                )}
              >
                <GraduationCap className="size-4 inline mr-1.5 -mt-0.5" />
                교사용 모드
              </button>
              <button
                onClick={() => setMode("student")}
                className={cn(
                  "px-4 py-1.5 text-sm font-semibold rounded-full transition-all",
                  mode === "student" ? "bg-accent text-accent-foreground shadow" : "text-muted-foreground"
                )}
              >
                <Users className="size-4 inline mr-1.5 -mt-0.5" />
                학생용 모드
              </button>
            </div>

            <div className="ml-auto flex items-center gap-3">
              {/* Notification popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="size-10 rounded-full bg-muted grid place-items-center relative"
                    aria-label="알림"
                  >
                    <Bell className="size-4" />
                    <span className="absolute top-2 right-2 size-2 rounded-full bg-accent" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                  <div className="px-4 py-3 border-b border-border">
                    <div className="font-display text-base">알림</div>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-border">
                    {NOTIFICATIONS.map((n, i) => (
                      <div key={i} className="px-4 py-3 hover:bg-muted/50 transition-colors">
                        <div className="text-sm text-foreground">{n.content}</div>
                        <div className="text-xs text-muted-foreground mt-1">{n.date}</div>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Profile popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="size-10 rounded-full bg-secondary grid place-items-center font-display text-lg"
                    aria-label="프로필"
                  >
                    {profile.initial}
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-72 p-0">
                  <ProfilePopoverContent profile={profile} onLogout={handleLogout} />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">
          <div data-mode={mode}>{children}</div>
        </main>
      </div>
    </div>
  );
}

function ProfilePopoverContent({
  profile,
  onLogout,
}: {
  profile: typeof TEACHER_PROFILE | typeof STUDENT_PROFILE;
  onLogout: () => void;
}) {
  const isStudent = "job" in profile;
  return (
    <div>
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="size-12 rounded-full bg-secondary grid place-items-center font-display text-xl">
            {profile.initial}
          </div>
          <div>
            <div className="font-display text-lg leading-tight">{profile.name}</div>
            <div className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {profile.modeLabel}
            </div>
          </div>
        </div>
        <dl className="space-y-1.5 text-sm">
          <Row label="학교">{profile.school}</Row>
          <Row label="학급">{profile.classInfo}</Row>
          {isStudent && <Row label="현재 직업">{(profile as typeof STUDENT_PROFILE).job}</Row>}
        </dl>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            // Close popover by dispatching escape
            document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
          }}
          className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-full border-2 border-border hover:bg-muted"
        >
          <X className="size-3.5" /> 닫기
        </button>
        <button
          onClick={onLogout}
          className="inline-flex items-center justify-center gap-1.5 text-sm font-bold px-3 py-2 rounded-full bg-primary text-primary-foreground shadow-[0_3px_0_0_oklch(0.55_0.15_240)]"
        >
          <LogOut className="size-3.5" /> 로그아웃
        </button>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="w-20 text-xs text-muted-foreground shrink-0 pt-0.5">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{children}</dd>
    </div>
  );
}
