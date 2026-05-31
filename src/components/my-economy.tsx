import { useMemo, useState } from "react";
import {
  Briefcase, Wallet, Ticket, Armchair, Receipt, Star, Trophy,
  Sparkles, Coins, X, ArrowDownCircle, ArrowUpCircle, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEconomy, type Transaction } from "@/components/mode-context";

const items = [
  { icon: Ticket, label: "간식 쿠폰", count: 3, tone: "orange" as const, desc: "매점에서 사용" },
  { icon: Armchair, label: "좌석 선택권", count: 1, tone: "blue" as const, desc: "원하는 자리로 이동" },
  { icon: Star, label: "숙제 면제권", count: 2, tone: "yellow" as const, desc: "1회용" },
  { icon: Trophy, label: "발표 우선권", count: 1, tone: "green" as const, desc: "이번 주 사용 가능" },
];

const TAXES = [
  { name: "소득세", amount: 320, due: "이번 주 금요일", progress: 70 },
  { name: "탄소세", amount: 150, due: "다음 주 월요일", progress: 30 },
];

const classmates = [
  "김민준", "이서연", "박지후", "최유나", "정하늘", "강도윤", "윤소율", "임주원",
];

const toneMap: Record<string, string> = {
  orange: "from-[color-mix(in_oklab,var(--brand-orange)_25%,white)] to-[color-mix(in_oklab,var(--brand-orange)_5%,white)] text-[var(--brand-orange)]",
  blue: "from-[color-mix(in_oklab,var(--brand-blue)_22%,white)] to-[color-mix(in_oklab,var(--brand-blue)_4%,white)] text-[var(--brand-blue)]",
  yellow: "from-[color-mix(in_oklab,var(--brand-yellow)_55%,white)] to-[color-mix(in_oklab,var(--brand-yellow)_15%,white)] text-[oklch(0.45_0.1_80)]",
  green: "from-[oklch(0.92_0.08_160)] to-[oklch(0.98_0.02_160)] text-[oklch(0.45_0.15_160)]",
};

export function MyEconomy() {
  const { balance, transactions, paidTaxes, transfer, payTax } = useEconomy();
  const [transferOpen, setTransferOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  return (
    <section className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <button
          onClick={() => setHistoryOpen(true)}
          className="lg:col-span-2 text-left rounded-3xl p-6 text-white relative overflow-hidden shadow-lg hover:scale-[1.005] transition-transform cursor-pointer"
          style={{ background: "linear-gradient(135deg, var(--brand-blue), oklch(0.55 0.18 250))" }}
        >
          <div className="absolute -right-10 -bottom-10 size-48 rounded-full bg-white/10" />
          <div className="absolute right-10 top-6 size-16 rounded-full bg-[var(--brand-yellow)]/40 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-90">
              <Wallet className="size-4" /> 내 통장
            </div>
            <div className="mt-2 font-display text-5xl tracking-tight">
              {balance.toLocaleString()} L
            </div>
            <div className="mt-1 text-sm opacity-90">최근 거래 {transactions.length}건 · 잔액 실시간 반영 🎉</div>
            <div className="mt-4 flex gap-2">
              <span
                role="button"
                onClick={(e) => { e.stopPropagation(); setTransferOpen(true); }}
                className="rounded-full bg-white text-[var(--brand-blue)] px-4 py-2 text-sm font-semibold shadow inline-flex items-center"
              >
                <Coins className="size-4 inline -mt-0.5 mr-1" /> 송금하기
              </span>
              <span className="rounded-full bg-white/15 backdrop-blur text-white px-4 py-2 text-sm font-semibold border border-white/30 inline-flex items-center">
                내역 보기
              </span>
            </div>
          </div>
        </button>

        <div className="rounded-3xl p-6 relative overflow-hidden shadow-sm border border-border"
          style={{ background: "linear-gradient(135deg, var(--brand-yellow), color-mix(in oklab, var(--brand-orange) 30%, white))" }}>
          <div className="absolute -right-6 -top-6 size-24 rounded-full bg-white/40" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[oklch(0.3_0.08_60)]">
              <Briefcase className="size-4" /> 나의 직업
            </div>
            <div className="mt-2 font-display text-3xl text-[oklch(0.25_0.05_60)]">환경 미화원 🧹</div>
            <div className="mt-1 text-sm text-[oklch(0.3_0.05_60)]">월급 120 L · Lv.3</div>
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
          {TAXES.map((t) => {
            const paid = paidTaxes.includes(t.name);
            return (
              <div key={t.name} className={cn("rounded-xl border p-4 flex items-center gap-4 transition-all",
                paid ? "border-emerald-300 bg-emerald-50/60" : "border-border")}>
                <div className={cn("size-12 rounded-full grid place-items-center font-display text-lg",
                  paid
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-[color-mix(in_oklab,var(--brand-orange)_15%,white)] text-[var(--brand-orange)]")}>
                  {paid ? <CheckCircle2 className="size-5" /> : t.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={cn("font-semibold", paid && "line-through text-muted-foreground")}>{t.name}</span>
                    <span className="font-display text-lg">{t.amount} L</span>
                  </div>
                  <div className="text-xs text-muted-foreground">기한: {t.due}</div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{ width: `${paid ? 100 : t.progress}%`, background: paid ? "oklch(0.65 0.15 160)" : "var(--brand-orange)" }} />
                  </div>
                </div>
                <button
                  disabled={paid}
                  onClick={() => {
                    const ok = payTax(t.name, t.amount);
                    if (!ok) setToast("잔액이 부족해서 세금을 납부할 수 없어요.");
                  }}
                  className={cn("rounded-full px-4 py-2 text-sm font-semibold transition-all",
                    paid
                      ? "bg-emerald-100 text-emerald-700 cursor-not-allowed"
                      : "bg-[var(--brand-blue)] text-white shadow-[0_3px_0_0_color-mix(in_oklab,var(--brand-blue)_60%,black)]")}
                >
                  {paid ? "납부 완료" : "납부"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {transferOpen && (
        <TransferModal
          onClose={() => setTransferOpen(false)}
          onSend={(name, n) => {
            const ok = transfer(name, n);
            if (!ok) setToast("잔액이 부족하거나 금액이 올바르지 않아요.");
            return ok;
          }}
        />
      )}
      {historyOpen && <HistoryModal balance={balance} transactions={transactions} onClose={() => setHistoryOpen(false)} />}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </section>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-4 py-2 rounded-full text-sm shadow-lg flex items-center gap-3">
      {message}
      <button onClick={onClose} className="opacity-80 hover:opacity-100"><X className="size-3.5" /></button>
    </div>
  );
}

function TransferModal({ onClose, onSend }: { onClose: () => void; onSend: (name: string, amount: number) => boolean }) {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState<string | null>(null);
  const [done, setDone] = useState<{ name: string; amount: number } | null>(null);

  const send = () => {
    const n = Number(amount);
    if (!n || !recipient) return;
    const ok = onSend(recipient, n);
    if (ok) setDone({ name: recipient, amount: n });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-card border border-border shadow-xl p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 size-8 rounded-full bg-muted grid place-items-center">
          <X className="size-4" />
        </button>

        {done ? (
          <div className="text-center py-6">
            <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center mx-auto">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="font-display text-2xl mt-4">송금 완료!</h3>
            <p className="text-sm text-muted-foreground mt-2">
              <strong className="text-foreground">{done.name}</strong>에게 <strong className="text-[var(--brand-blue)]">{done.amount}L</strong> 송금이 완료되었습니다.
            </p>
            <button onClick={onClose}
              className="mt-6 rounded-full bg-[var(--brand-blue)] text-white px-6 py-2.5 text-sm font-semibold">
              확인
            </button>
          </div>
        ) : (
          <>
            <h3 className="font-display text-2xl">친구에게 송금하기</h3>
            <p className="text-xs text-muted-foreground mt-1">반 친구에게 L을 보낼 수 있어요.</p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground">송금 금액 입력</label>
                <div className="mt-1 flex items-center rounded-xl border border-border bg-muted/40 px-3">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="flex-1 h-12 bg-transparent outline-none font-display text-2xl"
                  />
                  <span className="font-semibold text-muted-foreground">L</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground">받는 친구 선택</label>
                <div className="mt-1 max-h-44 overflow-auto rounded-xl border border-border p-2 grid grid-cols-2 gap-1.5">
                  {classmates.map((c) => (
                    <button
                      key={c}
                      onClick={() => setRecipient(c)}
                      className={cn("rounded-lg px-3 py-2 text-sm font-semibold text-left transition-all",
                        recipient === c
                          ? "bg-[var(--brand-blue)] text-white"
                          : "bg-muted/50 hover:bg-muted")}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={send}
                disabled={!amount || !recipient}
                className="w-full h-12 rounded-full bg-[var(--brand-blue)] text-white font-bold disabled:opacity-40 shadow-[0_4px_0_0_color-mix(in_oklab,var(--brand-blue)_60%,black)]"
              >
                송금하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const TYPE_LABEL: Record<Transaction["type"], string> = {
  transfer_out: "송금",
  transfer_in: "송금 수신",
  stock_buy: "주식 매수",
  stock_sell: "주식 매도",
  tax: "세금 납부",
  purchase: "상품 구매",
  income: "수입",
};

function formatWhen(ts: number) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function HistoryModal({ balance, transactions, onClose }: { balance: number; transactions: Transaction[]; onClose: () => void }) {
  const rows = useMemo(() => transactions, [transactions]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl bg-card border border-border shadow-xl p-6 relative max-h-[85vh] flex flex-col">
        <button onClick={onClose} className="absolute right-4 top-4 size-8 rounded-full bg-muted grid place-items-center">
          <X className="size-4" />
        </button>

        <div>
          <h3 className="font-display text-2xl">내 통장 내역</h3>
          <p className="text-xs text-muted-foreground mt-1">날짜 · 유형 · 금액 · 잔액 순으로 표시돼요.</p>
        </div>

        <div className="mt-4 rounded-2xl p-5 text-white"
          style={{ background: "linear-gradient(135deg, var(--brand-blue), oklch(0.55 0.18 250))" }}>
          <div className="text-xs opacity-80">현재 잔고</div>
          <div className="font-display text-4xl mt-1">{balance.toLocaleString()} L</div>
        </div>

        <div className="mt-4 flex-1 overflow-auto space-y-2">
          {rows.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-8">아직 거래 내역이 없어요.</div>
          )}
          {rows.map((t) => {
            const isIn = t.amount > 0;
            return (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                <div className={cn("size-10 rounded-full grid place-items-center shrink-0",
                  isIn ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-[var(--brand-orange)]")}>
                  {isIn ? <ArrowDownCircle className="size-5" /> : <ArrowUpCircle className="size-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">
                    <span className="text-muted-foreground text-[11px] mr-1.5">[{TYPE_LABEL[t.type]}]</span>
                    {t.label}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{formatWhen(t.at)} · 잔액 {t.balanceAfter.toLocaleString()}L</div>
                </div>
                <div className={cn("font-display text-base shrink-0",
                  isIn ? "text-emerald-600" : "text-[var(--brand-orange)]")}>
                  {isIn ? "+" : ""}{t.amount}L
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
