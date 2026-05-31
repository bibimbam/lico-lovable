import { useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import {
  Coins, Wallet, PiggyBank, Receipt, HeartHandshake, ShoppingBag,
  Sparkles, Users, TrendingUp, TrendingDown, AlertCircle, Lightbulb, X, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMode, useEvents, useEconomy } from "@/components/mode-context";

type Period = "all" | "month" | "week" | "day";

const PERIODS: { id: Period; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "month", label: "월별" },
  { id: "week", label: "주별" },
  { id: "day", label: "일별" },
];

const assetDist = [
  { name: "0–100", value: 4, fill: "var(--brand-blue)" },
  { name: "100–300", value: 11, fill: "var(--brand-yellow)" },
  { name: "300–500", value: 8, fill: "var(--brand-orange)" },
  { name: "500+", value: 5, fill: "oklch(0.7 0.15 160)" },
];

const topProducts = [
  { name: "숙제 면제권", sold: 18 },
  { name: "발표 우선권", sold: 12 },
  { name: "자리 선택권", sold: 9 },
  { name: "칭찬 쿠폰", sold: 7 },
  { name: "급식 우선권", sold: 4 },
];

export function Dashboard() {
  const [period, setPeriod] = useState<Period>("week");
  const { mode } = useMode();
  const { addEvent } = useEvents();
  const { balance, transactions, purchases, welfareFund, paidTaxes } = useEconomy();
  const [createOpen, setCreateOpen] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);

  const isTeacher = mode === "teacher";

  const taxCollected = transactions.filter((t) => t.type === "tax").reduce((s, t) => s - t.amount, 0);
  const totalConsumption = purchases.reduce((s, p) => s + p.price, 0);
  const totalSupply = 14820 + balance - 4820;

  return (
    <section className="space-y-6">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-3xl">교실 경제 대시보드</h2>
          <p className="text-sm text-muted-foreground mt-1">우리 반의 경제 흐름을 한눈에 확인하세요.</p>
        </div>
        <div className="inline-flex p-1 bg-muted rounded-full">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={cn(
                "px-4 py-1.5 text-xs font-semibold rounded-full transition-all",
                period === p.id ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      {/* AI Insight — Teacher only */}
      {isTeacher && (
        <div className="rounded-3xl p-5 md:p-6 relative overflow-hidden border-2 border-accent/30"
          style={{ background: "linear-gradient(135deg, color-mix(in oklab, var(--brand-yellow) 35%, white), color-mix(in oklab, var(--brand-orange) 12%, white))" }}>
          <div className="absolute -right-8 -bottom-8 size-40 rounded-full bg-white/40 blur-2xl" />
          <div className="relative flex gap-4 items-start">
            <div className="size-12 rounded-2xl bg-accent text-accent-foreground grid place-items-center shrink-0 shadow-[0_4px_0_0_oklch(0.58_0.15_45)]">
              <Lightbulb className="size-6" />
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 bg-white/70 backdrop-blur px-2.5 py-1 rounded-full text-[11px] font-bold text-accent">
                <Sparkles className="size-3" /> AI 교사 인사이트 · 시장 이벤트 제안
              </div>
              <p className="mt-2 font-display text-xl leading-snug text-foreground">
                최근 <span className="text-accent">국제 정세 변화</span>로 인해 기술 기업들의 주가가 하락하고 있습니다.
              </p>
              <p className="text-sm text-foreground/80 mt-1">
                국제 정세에 따른 <span className="font-bold">주식 하락장 이벤트</span>를 생성해볼까요?
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setCreateOpen(true)}
                  className="rounded-full bg-foreground text-background text-xs font-bold px-4 py-2 inline-flex items-center gap-1.5"
                >
                  <TrendingDown className="size-3.5" /> 이벤트 만들기
                </button>
                <button className="rounded-full bg-white/70 text-foreground text-xs font-semibold px-4 py-2 border border-border">
                  다른 추천 보기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 경제 현황 */}
      <Group title="경제 현황" icon={Coins}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Stat icon={Wallet} label="총 통화량" value={`${totalSupply.toLocaleString()} L`} delta="실시간" tone="blue" />
          <Stat icon={PiggyBank} label="내 자산" value={`${balance.toLocaleString()} L`} delta={`거래 ${transactions.length}건`} tone="yellow" />
          <ChartCard title="자산 분포" subtitle="학생별 자산 구간">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={assetDist} dataKey="value" nameKey="name" innerRadius={42} outerRadius={70} paddingAngle={3}>
                  {assetDist.map((d) => <Cell key={d.name} fill={d.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
              {assetDist.map((d) => (
                <div key={d.name} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <span className="size-2 rounded-sm" style={{ background: d.fill }} /> {d.name} ({d.value})
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </Group>

      {/* 세금 현황 */}
      <Group title="세금 현황" icon={Receipt}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={Receipt} label="누적 세금" value={`${(3240 + taxCollected).toLocaleString()} L`} delta={`+${taxCollected}`} tone="orange" />
          <ProgressStat label="세금 납부율" value={`${Math.min(100, 70 + paidTaxes.length * 15)}%`} progress={Math.min(100, 70 + paidTaxes.length * 15)} tone="blue" />
          <Stat icon={HeartHandshake} label="복지 기금 잔액" value={`${welfareFund.toLocaleString()} L`} delta="안정" tone="green" />
          <Stat icon={HeartHandshake} label="이번 주 복지 지급" value="320 L" delta="+50" tone="yellow" />
        </div>
      </Group>

      {/* 소비 현황 */}
      <Group title="소비 현황" icon={ShoppingBag}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Stat icon={ShoppingBag} label="총 소비 금액" value={`${(2180 + totalConsumption).toLocaleString()} L`} delta={`+${totalConsumption}`} tone="orange" />
          <ChartCard title="가장 많이 팔린 상품" subtitle="기간 내 판매 수">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topProducts} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                <Bar dataKey="sold" radius={[6, 6, 0, 0]} fill="var(--brand-orange)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
              <Sparkles className="size-3" /> AI 소비 성향 분석
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90">
              학생들은 <span className="font-bold text-accent">실용 상품보다 즉각적인 보상</span>을 제공하는 상품을 선호하는 경향이 있습니다.
              칭찬 쿠폰·발표 우선권 등 소액·고빈도 상품의 매출 비중이 67%를 차지해요.
            </p>
            <div className="mt-3 text-xs text-muted-foreground">
              제안: 장기 보상형 상품(스터디룸 이용권 등)에 할인 이벤트를 적용해보세요.
            </div>
          </div>
        </div>
      </Group>

      {/* 참여 현황 */}
      <Group title="참여 현황" icon={Users}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ProgressStat label="경제 활동 참여율" value="87%" progress={87} tone="blue" />
          <RankStat label="가장 적극적인 직업" name="환경 수호대" detail="평균 참여 96%" up />
          <RankStat label="가장 소극적인 직업" name="기상청" detail="평균 참여 54%" />
          <Stat icon={AlertCircle} label="미참여 학생 수" value="2명" delta="-1" tone="orange" />
        </div>
      </Group>

      {createOpen && (
        <CreateEventModal
          onClose={() => setCreateOpen(false)}
          onCreate={() => {
            addEvent({
              title: "국제 정세 악화 · 기술 산업 하락장",
              description: "국제 정세 변화로 인해 기술 산업 관련 기업들의 주가가 15% 하락합니다.",
              industries: ["기술"],
              pct: -15,
            });
            setCreateOpen(false);
            setDoneOpen(true);
          }}
        />
      )}
      {doneOpen && <EventDoneModal onClose={() => setDoneOpen(false)} />}
    </section>
  );
}

function CreateEventModal({ onClose, onCreate }: { onClose: () => void; onCreate: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-accent bg-accent/10 px-2 py-1 rounded-full">
              <Sparkles className="size-3" /> AI 이벤트 제안
            </div>
            <h3 className="font-display text-2xl mt-2">시장 이벤트 만들기</h3>
          </div>
          <button onClick={onClose} className="size-9 rounded-full bg-muted grid place-items-center">
            <X className="size-4" />
          </button>
        </div>
        <p className="text-sm text-foreground/85 mt-3 leading-relaxed">
          국제 정세 변화로 인해 <span className="font-bold">기술 산업 관련 기업</span>들의 주가가 <span className="font-bold text-destructive">15% 하락</span>하는 이벤트가 만들어집니다.
        </p>
        <div className="mt-4 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
          영향 산업: 기술 · 적용 범위: 우리 반 주식 시장 전체 · 표시 위치: 주식 시장 상단 배너
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 h-11 rounded-full bg-muted font-bold text-sm">닫기</button>
          <button onClick={onCreate} className="flex-1 h-11 rounded-full bg-accent text-accent-foreground font-bold text-sm shadow-[0_3px_0_0_oklch(0.58_0.15_45)]">
            이벤트 생성
          </button>
        </div>
      </div>
    </div>
  );
}

function EventDoneModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
        <div className="size-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 grid place-items-center">
          <CheckCircle2 className="size-6" />
        </div>
        <h3 className="font-display text-xl mt-3">주식 하락장 이벤트가 생성되었습니다.</h3>
        <p className="text-sm text-muted-foreground mt-1">주식 시장 상단에서 적용 중인 이벤트를 확인할 수 있어요.</p>
        <button onClick={onClose} className="mt-5 w-full h-11 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-[0_3px_0_0_oklch(0.55_0.15_240)]">
          확인
        </button>
      </div>
    </div>
  );
}


function Group({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-lg bg-primary/10 text-primary grid place-items-center">
          <Icon className="size-4" />
        </div>
        <h3 className="font-display text-xl">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Stat({ icon: Icon, label, value, delta, tone }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; delta: string;
  tone: "blue" | "yellow" | "orange" | "green";
}) {
  const toneMap: Record<string, string> = {
    blue: "bg-[color-mix(in_oklab,var(--brand-blue)_15%,white)] text-[var(--brand-blue)]",
    yellow: "bg-[color-mix(in_oklab,var(--brand-yellow)_45%,white)] text-[oklch(0.45_0.1_80)]",
    orange: "bg-[color-mix(in_oklab,var(--brand-orange)_18%,white)] text-[var(--brand-orange)]",
    green: "bg-[oklch(0.92_0.08_160)] text-[oklch(0.45_0.15_160)]",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={cn("size-9 rounded-xl grid place-items-center", toneMap[tone])}>
          <Icon className="size-4" />
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
          <TrendingUp className="size-3" /> {delta}
        </span>
      </div>
      <div className="mt-3 font-display text-2xl">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function ProgressStat({ label, value, progress, tone }: { label: string; value: string; progress: number; tone: "blue" | "orange" }) {
  const color = tone === "blue" ? "var(--brand-blue)" : "var(--brand-orange)";
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-3xl">{value}</div>
      <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${progress}%`, background: color }} />
      </div>
    </div>
  );
}

function RankStat({ label, name, detail, up }: { label: string; name: string; detail: string; up?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-xl">{name}</div>
      <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold"
        style={{ color: up ? "oklch(0.55 0.15 160)" : "var(--brand-orange)" }}>
        {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />} {detail}
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-2">
        <h4 className="font-display text-base">{title}</h4>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
