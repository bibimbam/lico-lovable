import { useMemo, useState } from "react";
import { Search, X, AlertTriangle, TrendingUp, Coins, Briefcase, Activity, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useStudents,
  useCreateStudent,
  useDeleteStudent,
  type Student,
} from "@/lib/data/students";

export function StudentManagement() {
  const { data: students = [], isLoading, error } = useStudents();
  const createStudent = useCreateStudent();
  const deleteStudent = useDeleteStudent();

  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Student | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState<Student | null>(null);

  const list = useMemo(
    () => students.filter((s) => s.name.includes(q) || s.job.includes(q)),
    [q, students]
  );

  const handleAdd = async (name: string, assets: number) => {
    await createStudent.mutateAsync({ name, assets });
    setAddOpen(false);
  };

  const handleDelete = async (s: Student) => {
    await deleteStudent.mutateAsync(s.id);
    setConfirmDel(null);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-display text-2xl">학생 관리</h3>
          <p className="text-sm text-muted-foreground mt-1">학생별 자산·직업·참여도를 관리해요. (교사 전용)</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="학생 검색"
              className="h-10 w-60 rounded-full bg-muted pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-[0_3px_0_0_oklch(0.55_0.15_240)]"
          >
            <Plus className="size-4" /> 학생 추가
          </button>
        </div>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">불러오는 중…</div>}
      {error && <div className="text-sm text-destructive">학생 정보를 불러오지 못했어요.</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {list.map((s) => (
          <div
            key={s.id}
            className="relative text-left rounded-2xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-md transition-all"
          >
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDel(s); }}
              className="absolute top-2 right-2 size-7 rounded-full bg-muted hover:bg-destructive hover:text-destructive-foreground grid place-items-center transition-colors"
              aria-label="학생 삭제"
            >
              <Trash2 className="size-3.5" />
            </button>
            <button onClick={() => setOpen(s)} className="w-full text-left">
              <div className="flex items-center gap-3 pr-6">
                <div className="size-11 rounded-full bg-secondary grid place-items-center font-display text-lg">
                  {s.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{s.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{s.job}</div>
                </div>
                {s.alerts.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-accent/15 text-accent px-2 py-0.5 rounded-full">
                    <AlertTriangle className="size-3" /> {s.alerts.length}
                  </span>
                )}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-muted/50 px-2 py-1.5">
                  <div className="text-muted-foreground">자산</div>
                  <div className="font-display text-base">{s.assets} L</div>
                </div>
                <div className="rounded-lg bg-muted/50 px-2 py-1.5">
                  <div className="text-muted-foreground">참여도</div>
                  <div className="font-display text-base">{s.participation}%</div>
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>

      {open && <StudentModal s={open} onClose={() => setOpen(null)} />}
      {addOpen && <AddModal onClose={() => setAddOpen(false)} onAdd={handleAdd} />}
      {confirmDel && (
        <ConfirmDeleteModal
          student={confirmDel}
          onClose={() => setConfirmDel(null)}
          onConfirm={() => handleDelete(confirmDel)}
        />
      )}
    </section>
  );
}

function AddModal({ onClose, onAdd }: { onClose: () => void; onAdd: (name: string, assets: number) => void }) {
  const [name, setName] = useState("");
  const [assets, setAssets] = useState("");
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-display text-2xl">학생 추가</h3>
          <button onClick={onClose} className="size-9 rounded-full bg-muted grid place-items-center">
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-3">
          <Field label="학생 이름">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 김민지"
              className="w-full h-11 rounded-xl bg-muted px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </Field>
          <Field label="초기 자산 (선택)">
            <input
              type="number"
              value={assets}
              onChange={(e) => setAssets(e.target.value)}
              placeholder="0"
              className="w-full h-11 rounded-xl bg-muted px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </Field>
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 h-11 rounded-full bg-muted font-bold text-sm">취소</button>
          <button
            disabled={!name.trim()}
            onClick={() => onAdd(name.trim(), Number(assets) || 0)}
            className="flex-1 h-11 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-[0_3px_0_0_oklch(0.55_0.15_240)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            추가하기
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ student, onClose, onConfirm }: { student: Student; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
        <div className="size-12 mx-auto rounded-full bg-destructive/10 text-destructive grid place-items-center">
          <AlertTriangle className="size-6" />
        </div>
        <h3 className="font-display text-xl mt-3">학생 삭제</h3>
        <p className="text-sm text-muted-foreground mt-1">
          정말 <span className="font-bold text-foreground">{student.name}</span> 학생을 삭제하시겠습니까?
        </p>
        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 h-11 rounded-full bg-muted font-bold text-sm">취소</button>
          <button onClick={onConfirm} className="flex-1 h-11 rounded-full bg-destructive text-destructive-foreground font-bold text-sm">
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function StudentModal({ s, onClose }: { s: Student; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="size-14 rounded-2xl bg-secondary grid place-items-center font-display text-2xl">
            {s.name[0]}
          </div>
          <div className="flex-1">
            <h3 className="font-display text-3xl">{s.name}</h3>
            <div className="text-sm text-muted-foreground">{s.job}</div>
          </div>
          <button onClick={onClose} className="size-9 rounded-full bg-muted grid place-items-center">
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Info icon={Coins} label="현재 자산" value={`${s.assets} L`} />
          <Info icon={Briefcase} label="현재 직업" value={s.job} />
          <Info icon={Activity} label="참여율" value={`${s.participation}%`} />
          <Info icon={TrendingUp} label="투자 수익" value={`${s.invest_gain >= 0 ? "+" : ""}${s.invest_gain}`} />
        </div>

        <div className="mt-5">
          <div className="font-display text-lg mb-2">경제 요약</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <Summary label="총 수입" value={s.income} tone="blue" />
            <Summary label="총 소비" value={s.spending} tone="orange" />
            <Summary label="총 세금" value={s.tax} tone="yellow" />
            <Summary label="투자 수익" value={s.invest_gain} tone="green" />
          </div>
        </div>

        {s.alerts.length > 0 && (
          <div className="mt-5">
            <div className="font-display text-lg mb-2 flex items-center gap-2">
              <AlertTriangle className="size-4 text-accent" /> AI 알림
            </div>
            <ul className="space-y-2">
              {s.alerts.map((a, i) => (
                <li key={i} className="rounded-xl border-2 border-accent/30 bg-accent/5 p-3 text-sm text-foreground">
                  {a}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icon className="size-3" /> {label}
      </div>
      <div className="font-display text-lg mt-0.5 truncate">{value}</div>
    </div>
  );
}

function Summary({ label, value, tone }: { label: string; value: number; tone: "blue" | "orange" | "yellow" | "green" }) {
  const toneMap: Record<string, string> = {
    blue: "bg-[color-mix(in_oklab,var(--brand-blue)_12%,white)] text-[var(--brand-blue)]",
    orange: "bg-[color-mix(in_oklab,var(--brand-orange)_15%,white)] text-[var(--brand-orange)]",
    yellow: "bg-[color-mix(in_oklab,var(--brand-yellow)_40%,white)] text-[oklch(0.45_0.1_80)]",
    green: "bg-[oklch(0.92_0.08_160)] text-[oklch(0.45_0.15_160)]",
  };
  return (
    <div className={cn("rounded-xl p-3", toneMap[tone])}>
      <div className="text-[11px] opacity-80">{label}</div>
      <div className="font-display text-lg">{value} L</div>
    </div>
  );
}
