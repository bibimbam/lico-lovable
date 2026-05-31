import { useState } from "react";
import { Pencil, Trash2, Plus, X, Briefcase, Users, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { useJobs, useUpsertJob, useDeleteJob, type Job, type JobIntensity } from "@/lib/data/jobs";

const INTENSITY_LABEL: Record<JobIntensity, string> = { low: "낮음", mid: "보통", high: "높음" };
const INTENSITY_COLOR: Record<JobIntensity, string> = {
  low: "bg-[oklch(0.92_0.08_160)] text-[oklch(0.45_0.15_160)]",
  mid: "bg-[color-mix(in_oklab,var(--brand-yellow)_45%,white)] text-[oklch(0.45_0.1_80)]",
  high: "bg-[color-mix(in_oklab,var(--brand-orange)_18%,white)] text-[var(--brand-orange)]",
};

type Draft = {
  id?: string;
  name: string;
  description: string;
  capacity: number;
  assigned: string[];
  intensity: JobIntensity;
  salary: number;
};

const EMPTY: Draft = { name: "", description: "", capacity: 1, assigned: [], intensity: "mid", salary: 100 };

export function JobManagement() {
  const { data: jobs = [], isLoading, error } = useJobs();
  const upsertJob = useUpsertJob();
  const deleteJob = useDeleteJob();

  const [editing, setEditing] = useState<Draft | null>(null);

  const totalSalary = jobs.reduce((sum, j) => sum + j.salary * j.assigned.length, 0);

  const save = async (j: Draft) => {
    await upsertJob.mutateAsync(j);
    setEditing(null);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-display text-2xl">직업 / 역할 관리</h3>
          <p className="text-sm text-muted-foreground mt-1">학급의 모든 직업을 관리하고 새 직업을 만들 수 있어요. (교사 전용)</p>
        </div>
        <button
          onClick={() => setEditing(EMPTY)}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-full shadow-[0_4px_0_0_oklch(0.55_0.15_240)]"
        >
          <Plus className="size-4" /> 새 직업 만들기
        </button>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">불러오는 중…</div>}
      {error && <div className="text-sm text-destructive">직업 정보를 불러오지 못했어요.</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SummaryCard icon={Briefcase} label="운영 직업 수" value={`${jobs.length}개`} tone="blue" />
        <SummaryCard icon={Users} label="배정 학생 수" value={`${jobs.reduce((s, j) => s + j.assigned.length, 0)}명`} tone="yellow" />
        <SummaryCard icon={Coins} label="총 예정 급여" value={`${totalSalary} L`} tone="orange" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {jobs.map((j: Job) => (
          <div key={j.id} className="rounded-2xl border border-border bg-card p-4 flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-display text-lg">{j.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{j.description}</div>
              </div>
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0", INTENSITY_COLOR[j.intensity])}>
                강도 {INTENSITY_LABEL[j.intensity]}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-muted/50 px-2 py-1.5">
                <div className="text-muted-foreground">인원 ({j.assigned.length}/{j.capacity})</div>
                <div className="font-semibold truncate">{j.assigned.join(", ") || "—"}</div>
              </div>
              <div className="rounded-lg bg-muted/50 px-2 py-1.5">
                <div className="text-muted-foreground">급여(개인)</div>
                <div className="font-display text-base">{j.salary} L</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setEditing({ ...j })}
                className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full border-2 border-border hover:border-primary/40"
              >
                <Pencil className="size-3.5" /> 수정
              </button>
              <button
                onClick={() => deleteJob.mutate(j.id)}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full border-2 border-border text-destructive hover:border-destructive/40"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <JobEditor
          job={editing}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}

function SummaryCard({ icon: Icon, label, value, tone }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string;
  tone: "blue" | "yellow" | "orange";
}) {
  const map: Record<string, string> = {
    blue: "bg-[color-mix(in_oklab,var(--brand-blue)_15%,white)] text-[var(--brand-blue)]",
    yellow: "bg-[color-mix(in_oklab,var(--brand-yellow)_45%,white)] text-[oklch(0.45_0.1_80)]",
    orange: "bg-[color-mix(in_oklab,var(--brand-orange)_18%,white)] text-[var(--brand-orange)]",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
      <div className={cn("size-10 rounded-xl grid place-items-center", map[tone])}>
        <Icon className="size-5" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-display text-xl">{value}</div>
      </div>
    </div>
  );
}

function JobEditor({ job, onSave, onClose }: { job: Draft; onSave: (j: Draft) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<Draft>(job);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-2xl">{job.id ? "직업 수정" : "새 직업 만들기"}</h3>
          <button onClick={onClose} className="size-9 rounded-full bg-muted grid place-items-center">
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-3">
          <Row label="직업 이름">
            <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="h-10 w-full rounded-xl border-2 border-border px-3 focus:border-primary focus:outline-none" />
          </Row>
          <Row label="설명">
            <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              rows={2} className="w-full rounded-xl border-2 border-border p-3 focus:border-primary focus:outline-none" />
          </Row>
          <div className="grid grid-cols-2 gap-3">
            <Row label="인원수">
              <input type="number" min={1} value={draft.capacity}
                onChange={(e) => setDraft({ ...draft, capacity: Math.max(1, Number(e.target.value) || 1) })}
                className="h-10 w-full rounded-xl border-2 border-border px-3 focus:border-primary focus:outline-none" />
            </Row>
            <Row label="보상 (L)">
              <input type="number" min={0} value={draft.salary}
                onChange={(e) => setDraft({ ...draft, salary: Math.max(0, Number(e.target.value) || 0) })}
                className="h-10 w-full rounded-xl border-2 border-border px-3 focus:border-primary focus:outline-none" />
            </Row>
          </div>
          <Row label="업무 강도">
            <div className="grid grid-cols-3 gap-2">
              {(["low", "mid", "high"] as const).map((i) => (
                <button key={i} onClick={() => setDraft({ ...draft, intensity: i })}
                  className={cn("rounded-xl border-2 py-2 text-sm font-semibold",
                    draft.intensity === i ? "border-primary bg-primary/5" : "border-border")}>
                  {INTENSITY_LABEL[i]}
                </button>
              ))}
            </div>
          </Row>
          <Row label="배정 학생 (쉼표로 구분)">
            <input
              value={draft.assigned.join(", ")}
              onChange={(e) => setDraft({ ...draft, assigned: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              placeholder="예: 김민준, 이서연"
              className="h-10 w-full rounded-xl border-2 border-border px-3 focus:border-primary focus:outline-none"
            />
          </Row>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full px-4 py-2 text-sm font-semibold border-2 border-border">취소</button>
          <button
            disabled={!draft.name.trim()}
            onClick={() => onSave(draft)}
            className="rounded-full px-5 py-2 text-sm font-bold bg-primary text-primary-foreground shadow-[0_4px_0_0_oklch(0.55_0.15_240)] disabled:opacity-50">
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-muted-foreground mb-1">{label}</div>
      {children}
    </label>
  );
}
