import { Briefcase, Wallet, Ticket, Armchair, Receipt, Star, Trophy, Sparkles, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { icon: Ticket, label: "간식 쿠폰", count: 3, tone: "orange" as const, desc: "매점에서 사용" },
  { icon: Armchair, label: "좌석 선택권", count: 1, tone: "blue" as const, desc: "원하는 자리로 이동" },
  { icon: Star, label: "숙제 면제권", count: 2, tone: "yellow" as const, desc: "1회용" },
  { icon: Trophy, label: "발표 우선권", count: 1, tone: "green" as const, desc: "이번 주 사용 가능" },
];

const taxes = [
  { name: "소득세", amount: 320, due: "이번 주 금요일", progress: 70 },
  { name: "탄소세", amount: 150, due: "다음 주 월요일", progress: 30 },
];

const toneMap: Record<string, string> = {
  orange: "from-[color-mix(in_oklab,var(--brand-orange)_25%,white)] to-[color-mix(in_oklab,var(--brand-orange)_5%,white)] text-[var(--brand-orange)]",
  blue: "from-[color-mix(in_oklab,var(--brand-blue)_22%,white)] to-[color-mix(in_oklab,var(--brand-blue)_4%,white)] text-[var(--brand-blue)]",
  yellow: "from-[color-mix(in_oklab,var(--brand-yellow)_55%,white)] to-[color-mix(in_oklab,var(--brand-yellow)_15%,white)] text-[oklch(0.45_0.1_80)]",
  green: "from-[oklch(0.92_0.08_160)] to-[oklch(0.98_0.02_160)] text-[oklch(0.45_0.15_160)]",
};

export function StudentDashboard() {
  return (
    <section className="space-y-5">
      {/* Hero: 나의 자산 + 직업 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg"
          style={{ background: "linear-gradient(135deg, var(--brand-blue), oklch(0.55 0.18 250))" }}>
          <div className="absolute -right-10 -bottom-10 size-48 rounded-full bg-white/10" />
          <div className="absolute right-10 top-6 size-16 rounded-full bg-[var(--brand-yellow)]/40 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-90">
              <Wallet className="size-4" /> 내 통장 잔고
            </div>
            <div className="mt-2 font-display text-5xl tracking-tight">
              4,820 L <span className="text-2xl opacity-80">리코</span>
            </div>
            <div className="mt-1 text-sm opacity-90">지난주 대비 +620 L · 저축률 52% 🎉</div>
            <div className="mt-4 flex gap-2">
              <button className="rounded-full bg-white text-[var(--brand-blue)] px-4 py-2 text-sm font-semibold shadow">
                <Coins className="size-4 inline -mt-0.5 mr-1" /> 송금하기
              </button>
              <button className="rounded-full bg-white/15 backdrop-blur text-white px-4 py-2 text-sm font-semibold border border-white/30">
                마켓 가기
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl p-6 relative overflow-hidden shadow-sm border border-border"
          style={{ background: "linear-gradient(135deg, var(--brand-yellow), color-mix(in oklab, var(--brand-orange) 30%, white))" }}>
          <div className="absolute -right-6 -top-6 size-24 rounded-full bg-white/40" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[oklch(0.3_0.08_60)]">
              <Briefcase className="size-4" /> 나의 직업
            </div>
            <div className="mt-2 font-display text-3xl text-[oklch(0.25_0.05_60)]">은행원 🏦</div>
            <div className="mt-1 text-sm text-[oklch(0.3_0.05_60)]">주급 450 L · Lv.3</div>
            <div className="mt-4">
              <div className="text-[11px] text-[oklch(0.3_0.05_60)] mb-1">다음 레벨까지</div>
              <div className="h-2 rounded-full bg-white/50 overflow-hidden">
                <div className="h-full rounded-full bg-[var(--brand-orange)]" style={{ width: "65%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 보유 아이템 */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-xl">내 아이템 보관함</h3>
            <p className="text-xs text-muted-foreground">쿠폰과 특별 권한을 모아두는 곳이에요.</p>
          </div>
          <Sparkles className="size-5 text-[var(--brand-yellow)]" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <div key={it.label}
                className={cn("rounded-2xl p-4 bg-gradient-to-br border border-white/60 shadow-sm relative overflow-hidden",
                  toneMap[it.tone])}>
                <div className="flex items-start justify-between">
                  <div className="size-10 rounded-xl bg-white/70 grid place-items-center backdrop-blur">
                    <Icon className="size-5" />
                  </div>
                  <span className="font-display text-2xl">×{it.count}</span>
                </div>
                <div className="mt-3 font-semibold text-foreground">{it.label}</div>
                <div className="text-[11px] text-foreground/60">{it.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 세금 현황 */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-xl">납부할 세금</h3>
            <p className="text-xs text-muted-foreground">기한 내에 납부하면 신용 점수가 올라가요!</p>
          </div>
          <div className="size-10 rounded-xl bg-[color-mix(in_oklab,var(--brand-orange)_18%,white)] grid place-items-center text-[var(--brand-orange)]">
            <Receipt className="size-5" />
          </div>
        </div>
        <div className="space-y-3">
          {taxes.map((t) => (
            <div key={t.name} className="rounded-xl border border-border p-4 flex items-center gap-4">
              <div className="size-12 rounded-full bg-[color-mix(in_oklab,var(--brand-orange)_15%,white)] grid place-items-center font-display text-lg text-[var(--brand-orange)]">
                {t.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold">{t.name}</span>
                  <span className="font-display text-lg">{t.amount} L</span>
                </div>
                <div className="text-xs text-muted-foreground">기한: {t.due}</div>
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-[var(--brand-orange)]"
                    style={{ width: `${t.progress}%` }} />
                </div>
              </div>
              <button className="rounded-full bg-[var(--brand-blue)] text-white px-4 py-2 text-sm font-semibold shadow-[0_3px_0_0_color-mix(in_oklab,var(--brand-blue)_60%,black)]">
                납부
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
