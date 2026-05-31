import { useState } from "react";
import {
  Sparkles, Coins, Wand2, Loader2, Pencil, CheckCircle2, RotateCcw,
  Info, Plus, Trash2, Calendar, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Grade = 4 | 5 | 6;
type Intensity = "low" | "mid" | "high";

type Job = { name: string; desc: string; capacity: number; salary: number; intensity: Intensity; emoji: string };
type Tax = { name: string; rate: string; desc: string };
type Welfare = { name: string; amount: string; desc: string };

type GeneratedSystem = {
  societyName: string;
  currency: { name: string; unit: string };
  jobs: Job[];
  taxes: Tax[];
  welfare: Welfare[];
  note: string;
};

const JOB_POOL: Omit<Job, "capacity">[] = [
  { name: "환경 수호대", emoji: "🧹", salary: 160, intensity: "high", desc: "교실 청소·재활용 관리" },
  { name: "급식 도우미", emoji: "\n🍱", salary: 140, intensity: "high", desc: "급식 배식·정리" },
  { name: "공무원(반장)", emoji: "🎖️", salary: 130, intensity: "mid", desc: "학급 운영·회의 진행" },
  { name: "공무원(부반장)", emoji: "🏅", salary: 110, intensity: "mid", desc: "반장 보조·전달" },
  { name: "상점 직원", emoji: "🛍️", salary: 100, intensity: "mid", desc: "마켓 운영·계산" },
  { name: "은행원", emoji: "🏦", salary: 120, intensity: "low", desc: "예금·대출·이자 지급" },
  { name: "국세청", emoji: "🧾", salary: 110, intensity: "low", desc: "세금 징수·기록" },
  { name: "기상청", emoji: "🌦️", salary: 90, intensity: "low", desc: "날씨·이벤트 예보" },
];

function recommendCapacity(students: number): number[] {
  // 총합이 students에 근접하도록 가중치로 배분
  const weights = [0.15, 0.18, 0.05, 0.05, 0.1, 0.12, 0.07, 0.05];
  const raw = weights.map((w) => Math.max(1, Math.round(students * w)));
  return raw;
}

function generate(grade: Grade, students: number): GeneratedSystem {
  const caps = recommendCapacity(students);
  const jobs: Job[] = JOB_POOL.map((j, i) => ({ ...j, capacity: caps[i] }));

  // 학년이 높을수록 세율을 약간 상향 (학습 난이도)
  const incomeRate = grade === 4 ? 5 : grade === 5 ? 7 : 8;

  return {
    societyName: `${grade}학년 ${students}명의 작은 경제`,
    currency: { name: "리코", unit: "L" },
    jobs,
    taxes: [
      { name: "소득세", rate: `${incomeRate}%`, desc: "급여에서 자동 차감" },
      { name: "소비세", rate: "5%", desc: "마켓 구매 시" },
      { name: "공동기금", rate: "2%", desc: "학급 공동 활동 비용" },
    ],
    welfare: [
      { name: "복지 지원금", amount: "주 30 L", desc: "자산이 평균의 30% 미만인 학생에게 지원" },
      { name: "참여 장려금", amount: "주 20 L", desc: "경제 활동 참여 학생 전원" },
    ],
    note: `AI가 ${grade}학년 ${students}명에 맞춰 직업 인원·세율을 자동 추천했어요. 모든 항목은 교사가 직접 수정 후 승인할 수 있습니다.`,
  };
}

export function EconomyGenerator() {
  const [grade, setGrade] = useState<Grade>(5);
  const [students, setStudents] = useState(28);
  const [startDate, setStartDate] = useState("2026-03-02");
  const [endDate, setEndDate] = useState("2026-07-18");
  const [loading, setLoading] = useState(false);
  const [system, setSystem] = useState<GeneratedSystem | null>(null);
  const [deployed, setDeployed] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    setDeployed(false);
    setTimeout(() => {
      setSystem(generate(grade, students));
      setLoading(false);
    }, 800);
  };

  const handleRegen = () => {
    if (!system) return;
    setLoading(true);
    setTimeout(() => {
      setSystem(generate(grade, students));
      setLoading(false);
    }, 500);
  };

  const updateJob = (i: number, patch: Partial<Job>) =>
    setSystem((s) => s && { ...s, jobs: s.jobs.map((j, idx) => (idx === i ? { ...j, ...patch } : j)) });
  const removeJob = (i: number) =>
    setSystem((s) => s && { ...s, jobs: s.jobs.filter((_, idx) => idx !== i) });
  const addJob = () =>
    setSystem((s) => s && { ...s, jobs: [...s.jobs, { name: "새 직업", desc: "설명 입력", capacity: 1, salary: 100, intensity: "mid", emoji: "✨" }] });
  const updateTax = (i: number, patch: Partial<Tax>) =>
    setSystem((s) => s && { ...s, taxes: s.taxes.map((t, idx) => (idx === i ? { ...t, ...patch } : t)) });
  const updateWelfare = (i: number, patch: Partial<Welfare>) =>
    setSystem((s) => s && { ...s, welfare: s.welfare.map((w, idx) => (idx === i ? { ...w, ...patch } : w)) });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="size-14 rounded-2xl bg-primary grid place-items-center shadow-[0_5px_0_0_oklch(0.55_0.15_240)]">
          <Wand2 className="size-6 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-2xl">AI 경제 생성기</h3>
          <p className="text-sm text-muted-foreground mt-1">
            학년·학생 수·운영 기간을 입력하면 AI가 직업·세금·복지를 추천해요. 교사 승인 후 학급에 배포됩니다.
          </p>
        </div>
      </div>

      <section className="bg-card border border-border rounded-3xl p-6 space-y-5">
        <Field label="학년 (초등)" helper="대상 학년을 선택하세요">
          <div className="flex flex-wrap gap-2">
            {([4, 5, 6] as Grade[]).map((y) => (
              <button
                key={y}
                onClick={() => setGrade(y)}
                className={cn(
                  "size-14 rounded-2xl border-2 font-display text-xl transition-all",
                  grade === y
                    ? "border-accent bg-accent text-accent-foreground shadow-[0_3px_0_0_oklch(0.58_0.15_45)]"
                    : "border-border hover:border-accent/40"
                )}
              >
                {y}
              </button>
            ))}
            <span className="self-center text-sm text-muted-foreground ml-1">학년</span>
          </div>
        </Field>

        <Field label="학생 수" helper="1~40명">
          <div className="flex items-center gap-3 max-w-md">
            <input
              type="number" min={1} max={40} value={students}
              onChange={(e) => setStudents(Math.max(1, Math.min(40, Number(e.target.value) || 1)))}
              className="h-12 w-32 rounded-2xl border-2 border-border px-4 text-lg font-display focus:border-primary focus:outline-none"
            />
            <span className="text-sm text-muted-foreground">명</span>
            <input type="range" min={1} max={40} value={students}
              onChange={(e) => setStudents(Number(e.target.value))}
              className="flex-1 accent-[color:var(--brand-blue)]" />
          </div>
        </Field>

        <Field label="운영 기간" helper="경제 시스템을 운영할 기간을 직접 입력하세요">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Calendar className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="h-12 rounded-2xl border-2 border-border pl-10 pr-3 font-medium focus:border-primary focus:outline-none"
              />
            </div>
            <span className="text-muted-foreground">~</span>
            <div className="relative">
              <Calendar className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="h-12 rounded-2xl border-2 border-border pl-10 pr-3 font-medium focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </Field>

        <div className="pt-1">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3.5 rounded-full shadow-[0_5px_0_0_oklch(0.55_0.15_240)] hover:translate-y-[1px] hover:shadow-[0_4px_0_0_oklch(0.55_0.15_240)] transition-all disabled:opacity-70"
          >
            {loading ? <><Loader2 className="size-4 animate-spin" /> AI가 설계 중…</>
                     : <><Sparkles className="size-4" /> AI 경제 시스템 생성하기</>}
          </button>
        </div>
      </section>

      {system && (
        <section className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex flex-wrap items-center gap-3">
            <div className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold",
              deployed ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            )}>
              {deployed ? <><CheckCircle2 className="size-3.5" /> 배포 완료</> : <><Pencil className="size-3.5" /> 미리보기 · 편집 가능</>}
            </div>
            <div className="text-sm text-muted-foreground">
              {deployed ? "학급에 적용되었습니다." : "각 항목을 직접 수정한 뒤 ‘승인 및 배포’를 눌러주세요."}
            </div>
            <div className="ml-auto flex gap-2">
              <button onClick={handleRegen} disabled={loading}
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full border-2 border-border hover:border-primary/40">
                <RotateCcw className="size-3.5" /> 다시 생성
              </button>
              <button onClick={() => setDeployed(true)} disabled={deployed}
                className="inline-flex items-center gap-1.5 text-sm font-bold px-5 py-2 rounded-full bg-accent text-accent-foreground shadow-[0_4px_0_0_oklch(0.58_0.15_45)] disabled:opacity-60">
                <ShieldCheck className="size-4" /> 승인 및 배포
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4 flex gap-3">
            <div className="size-9 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0">
              <Info className="size-4" />
            </div>
            <p className="text-sm text-foreground/80">{system.note}</p>
          </div>

          {/* Society + Currency */}
          <div className="grid lg:grid-cols-2 gap-4">
            <EditCard label="경제 사회 이름">
              <input value={system.societyName} disabled={deployed}
                onChange={(e) => setSystem((s) => s && { ...s, societyName: e.target.value })}
                className="w-full bg-transparent font-display text-2xl outline-none border-b-2 border-transparent focus:border-primary py-1" />
            </EditCard>
            <EditCard label="화폐">
              <div className="flex gap-2 items-center">
                <input value={system.currency.name} disabled={deployed}
                  onChange={(e) => setSystem((s) => s && { ...s, currency: { ...s.currency, name: e.target.value } })}
                  className="flex-1 bg-transparent font-display text-2xl outline-none border-b-2 border-transparent focus:border-primary py-1" />
                <span className="text-muted-foreground">·</span>
                <input value={system.currency.unit} disabled={deployed}
                  onChange={(e) => setSystem((s) => s && { ...s, currency: { ...s.currency, unit: e.target.value } })}
                  className="w-24 bg-transparent font-display text-xl outline-none border-b-2 border-transparent focus:border-primary py-1" />
                <Coins className="size-5 text-primary" />
              </div>
            </EditCard>
          </div>

          {/* Jobs */}
          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-display text-xl">직업 ({system.jobs.length})</h4>
              {!deployed && (
                <button onClick={addJob} className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                  <Plus className="size-3" /> 직업 추가
                </button>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {system.jobs.map((j, i) => (
                <div key={i} className="rounded-2xl border border-border p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{j.emoji}</span>
                    <input value={j.name} disabled={deployed}
                      onChange={(e) => updateJob(i, { name: e.target.value })}
                      className="flex-1 bg-transparent font-bold outline-none border-b border-transparent focus:border-primary" />
                    {!deployed && (
                      <button onClick={() => removeJob(i)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                  <input value={j.desc} disabled={deployed}
                    onChange={(e) => updateJob(i, { desc: e.target.value })}
                    className="w-full text-xs text-muted-foreground bg-transparent outline-none border-b border-transparent focus:border-primary" />
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <MiniField label="추천 인원">
                      <input type="number" min={1} value={j.capacity} disabled={deployed}
                        onChange={(e) => updateJob(i, { capacity: Math.max(1, Number(e.target.value) || 1) })}
                        className="w-full bg-transparent font-display text-base outline-none" />
                    </MiniField>
                    <MiniField label="보상(L)">
                      <input type="number" min={0} value={j.salary} disabled={deployed}
                        onChange={(e) => updateJob(i, { salary: Math.max(0, Number(e.target.value) || 0) })}
                        className="w-full bg-transparent font-display text-base outline-none" />
                    </MiniField>
                    <MiniField label="강도">
                      <select value={j.intensity} disabled={deployed}
                        onChange={(e) => updateJob(i, { intensity: e.target.value as Intensity })}
                        className="w-full bg-transparent font-semibold text-sm outline-none">
                        <option value="low">낮음</option>
                        <option value="mid">보통</option>
                        <option value="high">높음</option>
                      </select>
                    </MiniField>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Taxes & Welfare */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-3xl border border-border bg-card p-5">
              <h4 className="font-display text-xl mb-3">세금 정책</h4>
              <div className="space-y-2">
                {system.taxes.map((t, i) => (
                  <div key={i} className="rounded-xl border border-border p-3">
                    <div className="flex items-center gap-2">
                      <input value={t.name} disabled={deployed}
                        onChange={(e) => updateTax(i, { name: e.target.value })}
                        className="flex-1 font-bold bg-transparent outline-none border-b border-transparent focus:border-primary" />
                      <input value={t.rate} disabled={deployed}
                        onChange={(e) => updateTax(i, { rate: e.target.value })}
                        className="w-20 font-display text-lg text-right bg-transparent outline-none border-b border-transparent focus:border-primary" />
                    </div>
                    <input value={t.desc} disabled={deployed}
                      onChange={(e) => updateTax(i, { desc: e.target.value })}
                      className="w-full text-xs text-muted-foreground bg-transparent outline-none mt-1 border-b border-transparent focus:border-primary" />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-card p-5">
              <h4 className="font-display text-xl mb-3">복지 정책</h4>
              <div className="space-y-2">
                {system.welfare.map((w, i) => (
                  <div key={i} className="rounded-xl border border-border p-3">
                    <div className="flex items-center gap-2">
                      <input value={w.name} disabled={deployed}
                        onChange={(e) => updateWelfare(i, { name: e.target.value })}
                        className="flex-1 font-bold bg-transparent outline-none border-b border-transparent focus:border-primary" />
                      <input value={w.amount} disabled={deployed}
                        onChange={(e) => updateWelfare(i, { amount: e.target.value })}
                        className="w-28 font-display text-base text-right bg-transparent outline-none border-b border-transparent focus:border-primary" />
                    </div>
                    <input value={w.desc} disabled={deployed}
                      onChange={(e) => updateWelfare(i, { desc: e.target.value })}
                      className="w-full text-xs text-muted-foreground bg-transparent outline-none mt-1 border-b border-transparent focus:border-primary" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Field({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <div className="font-bold">{label}</div>
        {helper && <div className="text-xs text-muted-foreground">{helper}</div>}
      </div>
      {children}
    </div>
  );
}

function MiniField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-muted/40 px-2 py-1.5">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function EditCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <div className="text-xs font-semibold text-muted-foreground mb-1">{label}</div>
      {children}
    </div>
  );
}
