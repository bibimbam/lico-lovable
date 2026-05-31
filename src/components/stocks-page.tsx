import { useMemo, useState } from "react";
import {
  Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { TrendingUp, TrendingDown, Newspaper, Sparkles, AlertTriangle, X, Briefcase, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMode, useEvents, useEconomy, type StockEvent, type Holding } from "@/components/mode-context";

type Stock = {
  ticker: string;
  name: string;
  industry: string;
  basePrice: number;
  baseChange: number;
  series: { d: string; v: number }[];
};

const STOCKS: Stock[] = [
  { ticker: "AE", name: "A전자", industry: "전자/반도체/기술", basePrice: 124, baseChange: 3.2,
    series: [{ d:"월",v:110},{d:"화",v:115},{d:"수",v:118},{d:"목",v:120},{d:"금",v:124}] },
  { ticker: "HM", name: "H모빌리티", industry: "자동차/이동수단", basePrice: 89, baseChange: -1.4,
    series: [{d:"월",v:92},{d:"화",v:91},{d:"수",v:88},{d:"목",v:90},{d:"금",v:89}] },
  { ticker: "CF", name: "C푸드", industry: "식품", basePrice: 56, baseChange: 1.8,
    series: [{d:"월",v:52},{d:"화",v:53},{d:"수",v:55},{d:"목",v:54},{d:"금",v:56}] },
  { ticker: "NT", name: "N테크", industry: "IT/플랫폼/기술", basePrice: 210, baseChange: 5.6,
    series: [{d:"월",v:190},{d:"화",v:195},{d:"수",v:202},{d:"목",v:206},{d:"금",v:210}] },
  { ticker: "KB", name: "K바이오", industry: "제약/바이오", basePrice: 78, baseChange: -0.6,
    series: [{d:"월",v:80},{d:"화",v:79},{d:"수",v:78},{d:"목",v:77},{d:"금",v:78}] },
  { ticker: "GE", name: "G에너지", industry: "친환경/에너지", basePrice: 142, baseChange: 2.4,
    series: [{d:"월",v:135},{d:"화",v:138},{d:"수",v:140},{d:"목",v:139},{d:"금",v:142}] },
];

const NEWS = [
  { tone: "blue", title: "A전자, 신제품 공개로 관심 ↑", desc: "신학기 학용품 수요가 늘면서 전자 산업이 활기를 띠고 있어요." },
  { tone: "orange", title: "G에너지, 친환경 정책 수혜", desc: "교실 '탄소세 이벤트' 이후 친환경 기업의 가치가 올라가는 중!" },
  { tone: "yellow", title: "C푸드, 급식 메뉴 변화 주목", desc: "이번 달 인기 메뉴가 매출에 어떻게 반영될까요?" },
];

function eventAffects(stock: Stock, ev: StockEvent) {
  return ev.industries.some((kw) => stock.industry.includes(kw));
}

function applyEvents(stock: Stock, events: StockEvent[]) {
  let totalPct = 0;
  for (const ev of events) if (eventAffects(stock, ev)) totalPct += ev.pct;
  const factor = 1 + totalPct / 100;
  return {
    price: Math.max(1, Math.round(stock.basePrice * factor)),
    change: Math.round((stock.baseChange + totalPct) * 10) / 10,
    series: stock.series.map((p) => ({ ...p, v: Math.max(1, Math.round(p.v * factor)) })),
    affected: totalPct !== 0,
  };
}

type TradeAction = { kind: "buy" | "sell"; stock: Stock; price: number };

export function StocksPage() {
  const { mode } = useMode();
  const { events, removeEvent } = useEvents();
  const { balance, holdings, buyStock, sellStock } = useEconomy();
  const isTeacher = mode === "teacher";

  const enriched = useMemo(
    () => STOCKS.map((s) => ({ stock: s, ...applyEvents(s, events) })),
    [events]
  );

  const [selectedTicker, setSelectedTicker] = useState<string>(STOCKS[0].ticker);
  const selected = enriched.find((x) => x.stock.ticker === selectedTicker) ?? enriched[0];

  const [trade, setTrade] = useState<TradeAction | null>(null);
  const [done, setDone] = useState<TradeAction | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const applyTrade = (t: TradeAction): boolean => {
    if (t.kind === "buy") return buyStock(t.stock.ticker, t.stock.name, t.price, 1);
    return sellStock(t.stock.ticker, t.price, 1);
  };

  const portfolio = useMemo(() => {
    const rows = holdings.map((h) => {
      const e = enriched.find((x) => x.stock.ticker === h.ticker);
      const currentPrice = e?.price ?? h.avgPrice;
      const marketValue = currentPrice * h.shares;
      const costBasis = h.avgPrice * h.shares;
      const profit = marketValue - costBasis;
      const returnPct = costBasis > 0 ? (profit / costBasis) * 100 : 0;
      return {
        holding: h,
        stock: e?.stock,
        currentPrice,
        marketValue,
        costBasis,
        profit,
        returnPct,
      };
    });
    const totalValue = rows.reduce((s, r) => s + r.marketValue, 0);
    const totalCost = rows.reduce((s, r) => s + r.costBasis, 0);
    const totalProfit = totalValue - totalCost;
    const totalReturnPct = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
    return { rows, totalValue, totalCost, totalProfit, totalReturnPct };
  }, [holdings, enriched]);


  return (
    <section className="space-y-5">
      <header>
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
          <TrendingUp className="size-3.5" /> 주식 시장 (학습용)
        </div>
        <h2 className="font-display text-3xl mt-2">우리 반 작은 주식 시장</h2>
        <p className="text-sm text-muted-foreground mt-1">
          실제 한국 경제 흐름을 교육용으로 단순화해 학급별로 다르게 제공돼요. 회사 이름은 가상입니다.
        </p>
      </header>

      {events.length > 0 && (
        <div className="rounded-2xl border-2 border-accent/40 bg-accent/10 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-accent">
            <AlertTriangle className="size-3.5" /> 현재 적용 중인 이벤트
          </div>
          <ul className="mt-2 space-y-2">
            {events.map((ev) => (
              <li key={ev.id} className="flex items-start justify-between gap-3 rounded-xl bg-card/80 border border-border p-3">
                <div>
                  <div className="font-bold text-sm">{ev.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {ev.industries.join(", ")} 주가 {ev.pct > 0 ? "+" : ""}{ev.pct}%
                  </div>
                </div>
                {isTeacher && (
                  <button
                    onClick={() => removeEvent(ev.id)}
                    className="size-7 rounded-full bg-muted grid place-items-center hover:bg-destructive hover:text-destructive-foreground"
                    aria-label="이벤트 종료"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isTeacher && (
        <>
          <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] grid place-items-center">
              <Wallet className="size-5" />
            </div>
            <div className="flex-1">
              <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">사용 가능 잔액</div>
              <div className="font-display text-2xl">{balance.toLocaleString()} L</div>
            </div>
          </div>
          <MyStocksSection portfolio={portfolio} />
        </>
      )}

      <div className="grid lg:grid-cols-3 gap-4">

        <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-muted-foreground">{selected.stock.industry}</div>
              <h3 className="font-display text-2xl">
                {selected.stock.name} <span className="text-muted-foreground text-base">({selected.stock.ticker})</span>
                {selected.affected && (
                  <span className="ml-2 text-[10px] font-bold bg-accent/15 text-accent px-2 py-0.5 rounded-full align-middle">이벤트 영향</span>
                )}
              </h3>
            </div>
            <div className="text-right">
              <div className="font-display text-3xl">{selected.price} <span className="text-sm text-muted-foreground">L</span></div>
              <div className={cn("inline-flex items-center gap-1 text-xs font-bold mt-1",
                selected.change >= 0 ? "text-emerald-600" : "text-destructive")}>
                {selected.change >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                {selected.change >= 0 ? "+" : ""}{selected.change}%
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={selected.series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="d" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
              <Line type="monotone" dataKey="v" stroke="var(--brand-blue)" strokeWidth={3}
                dot={{ r: 4, fill: "var(--brand-yellow)", stroke: "var(--brand-blue)", strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>

          {!isTeacher ? (
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setTrade({ kind: "buy", stock: selected.stock, price: selected.price })}
                className="flex-1 rounded-full bg-primary text-primary-foreground font-bold py-2.5 shadow-[0_3px_0_0_oklch(0.55_0.15_240)]"
              >
                매수
              </button>
              <button
                onClick={() => setTrade({ kind: "sell", stock: selected.stock, price: selected.price })}
                className="flex-1 rounded-full bg-accent text-accent-foreground font-bold py-2.5 shadow-[0_3px_0_0_oklch(0.58_0.15_45)]"
              >
                매도
              </button>
            </div>
          ) : (
            <div className="mt-3 rounded-xl bg-muted/60 text-xs text-muted-foreground text-center py-3">
              교사 모드에서는 거래에 참여할 수 없어요. 시장 모니터링과 이벤트 관리만 가능합니다.
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="rounded-3xl border border-border bg-card p-4">
            <h4 className="font-display text-lg mb-2 flex items-center gap-2">
              <Sparkles className="size-4 text-accent" /> AI 맞춤 시장
            </h4>
            <p className="text-xs text-muted-foreground">학급 활동에 맞춰 종목과 가격이 달라져요. 다른 반과는 시장이 다를 수 있어요!</p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-4 space-y-2 max-h-[260px] overflow-auto">
            {enriched.map(({ stock: s, price, change, affected }) => (
              <button key={s.ticker} onClick={() => setSelectedTicker(s.ticker)}
                className={cn("w-full text-left rounded-xl p-2.5 flex items-center justify-between hover:bg-muted/60 transition-colors",
                  selectedTicker === s.ticker && "bg-muted")}>
                <div>
                  <div className="font-bold text-sm flex items-center gap-1.5">
                    {s.name}
                    {affected && <span className="size-1.5 rounded-full bg-accent" />}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{s.industry}</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-sm">{price}</div>
                  <div className={cn("text-[10px] font-bold",
                    change >= 0 ? "text-emerald-600" : "text-destructive")}>
                    {change >= 0 ? "+" : ""}{change}%
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5">
        <h4 className="font-display text-xl mb-3 flex items-center gap-2">
          <Newspaper className="size-5 text-primary" /> 오늘의 시장 이야기
        </h4>
        <div className="grid md:grid-cols-3 gap-3">
          {NEWS.map((n, i) => (
            <div key={i} className="rounded-2xl border border-border p-4 bg-muted/30">
              <div className="font-bold">{n.title}</div>
              <p className="text-xs text-muted-foreground mt-1">{n.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {trade && (
        <ConfirmTradeModal
          action={trade}
          onClose={() => setTrade(null)}
          onConfirm={() => {
            const t = trade;
            const ok = applyTrade(t);
            setTrade(null);
            if (ok) setDone(t);
            else setToast(t.kind === "buy" ? "잔액이 부족해서 매수할 수 없어요." : "보유 수량이 부족해요.");
          }}
        />
      )}
      {done && (
        <TradeDoneModal action={done} onClose={() => setDone(null)} />
      )}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-4 py-2 rounded-full text-sm shadow-lg flex items-center gap-3">
          {toast}
          <button onClick={() => setToast(null)} className="opacity-80 hover:opacity-100"><X className="size-3.5" /></button>
        </div>
      )}
    </section>
  );
}

function ConfirmTradeModal({ action, onClose, onConfirm }: { action: TradeAction; onClose: () => void; onConfirm: () => void }) {
  const isBuy = action.kind === "buy";
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-3xl max-w-sm w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-xl">{isBuy ? "매수 확인" : "매도 확인"}</h3>
        <p className="text-sm text-muted-foreground mt-2">
          <span className="font-bold text-foreground">{action.stock.name}</span>을(를){" "}
          <span className="font-bold text-foreground">{action.price}L</span>에 {isBuy ? "매수" : "매도"}하시겠습니까?
        </p>
        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 h-11 rounded-full bg-muted font-bold text-sm">닫기</button>
          <button
            onClick={onConfirm}
            className={cn(
              "flex-1 h-11 rounded-full font-bold text-sm",
              isBuy
                ? "bg-primary text-primary-foreground shadow-[0_3px_0_0_oklch(0.55_0.15_240)]"
                : "bg-accent text-accent-foreground shadow-[0_3px_0_0_oklch(0.58_0.15_45)]"
            )}
          >
            {isBuy ? "매수하기" : "매도하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TradeDoneModal({ action, onClose }: { action: TradeAction; onClose: () => void }) {
  const isBuy = action.kind === "buy";
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
        <div className="size-12 mx-auto rounded-full bg-primary/10 text-primary grid place-items-center">
          <TrendingUp className="size-6" />
        </div>
        <h3 className="font-display text-xl mt-3">{isBuy ? "매수가 완료되었습니다." : "매도가 완료되었습니다."}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {action.stock.name} · {action.price}L
        </p>
        <button onClick={onClose} className="mt-5 w-full h-11 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-[0_3px_0_0_oklch(0.55_0.15_240)]">
          확인
        </button>
      </div>
    </div>
  );
}

type PortfolioRow = {
  holding: Holding;
  stock?: Stock;
  currentPrice: number;
  marketValue: number;
  costBasis: number;
  profit: number;
  returnPct: number;
};

type Portfolio = {
  rows: PortfolioRow[];
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  totalReturnPct: number;
};

function MyStocksSection({ portfolio }: { portfolio: Portfolio }) {
  const { rows, totalValue, totalProfit, totalReturnPct } = portfolio;
  const fmtSign = (n: number) => (n > 0 ? "+" : "");
  const toneClass = (n: number) =>
    n > 0 ? "text-emerald-600" : n < 0 ? "text-destructive" : "text-muted-foreground";

  return (
    <section className="rounded-3xl border border-border bg-card p-5">
      <h3 className="font-display text-xl mb-3 flex items-center gap-2">
        <Briefcase className="size-5 text-primary" /> 내 주식
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="총 투자 자산" value={`${totalValue}L`} />
        <SummaryCard
          label="총 수익률"
          value={`${fmtSign(totalReturnPct)}${totalReturnPct.toFixed(1)}%`}
          valueClass={toneClass(totalReturnPct)}
        />
        <SummaryCard
          label="총 수익금"
          value={`${fmtSign(totalProfit)}${totalProfit}L`}
          valueClass={toneClass(totalProfit)}
        />
        <SummaryCard label="보유 종목 수" value={`${rows.length}개`} />
      </div>

      <div className="mt-4">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center">
            <div className="font-bold text-sm">아직 보유한 주식이 없습니다.</div>
            <p className="text-xs text-muted-foreground mt-1">
              주식을 구매하여 투자 활동을 시작해보세요.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {rows.map((r) => (
              <div key={r.holding.ticker} className="rounded-2xl border border-border p-4 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm">{r.stock?.name ?? r.holding.ticker}</div>
                    <div className="text-[11px] text-muted-foreground">{r.holding.shares}주 보유</div>
                  </div>
                  <div className={cn("text-sm font-bold", toneClass(r.returnPct))}>
                    {fmtSign(r.returnPct)}{r.returnPct.toFixed(1)}%
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-y-1 text-[11px]">
                  <span className="text-muted-foreground">평균 매수가</span>
                  <span className="text-right font-semibold">{r.holding.avgPrice}L</span>
                  <span className="text-muted-foreground">현재가</span>
                  <span className="text-right font-semibold">{r.currentPrice}L</span>
                  <span className="text-muted-foreground">평가 금액</span>
                  <span className="text-right font-semibold">{r.marketValue}L</span>
                  <span className="text-muted-foreground">수익금</span>
                  <span className={cn("text-right font-bold", toneClass(r.profit))}>
                    {fmtSign(r.profit)}{r.profit}L
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryCard({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-3">
      <div className="text-[11px] font-bold text-muted-foreground">{label}</div>
      <div className={cn("font-display text-xl mt-1", valueClass)}>{value}</div>
    </div>
  );
}
