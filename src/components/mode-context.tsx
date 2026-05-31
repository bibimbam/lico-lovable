import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react";

export type Mode = "teacher" | "student";

export type StockEvent = {
  id: string;
  title: string;
  description: string;
  industries: string[];
  pct: number;
  createdAt: number;
};

export type Holding = { ticker: string; name: string; shares: number; avgPrice: number };

export type TxType =
  | "transfer_out"
  | "transfer_in"
  | "stock_buy"
  | "stock_sell"
  | "tax"
  | "purchase"
  | "income";

export type Transaction = {
  id: string;
  type: TxType;
  label: string;
  amount: number; // signed: + = balance up, - = balance down
  balanceAfter: number;
  at: number;
};

export type Purchase = { id: string; name: string; price: number; at: number };

type Economy = {
  balance: number;
  holdings: Holding[];
  transactions: Transaction[];
  paidTaxes: string[];
  purchases: Purchase[];
  welfareFund: number;
};

type Ctx = {
  mode: Mode;
  setMode: (m: Mode) => void;

  events: StockEvent[];
  addEvent: (e: Omit<StockEvent, "id" | "createdAt">) => void;
  removeEvent: (id: string) => void;

  // economy
  balance: number;
  holdings: Holding[];
  transactions: Transaction[];
  paidTaxes: string[];
  purchases: Purchase[];
  welfareFund: number;

  transfer: (name: string, amount: number) => boolean;
  buyStock: (ticker: string, name: string, price: number, shares?: number) => boolean;
  sellStock: (ticker: string, price: number, shares?: number) => boolean;
  payTax: (name: string, amount: number) => boolean;
  buyProduct: (name: string, price: number) => boolean;
  resetEconomy: () => void;
};

const ModeContext = createContext<Ctx | null>(null);

const MODE_KEY = "lico:mode";
const EVENTS_KEY = "lico:events";
const ECONOMY_KEY = "lico:economy:v1";

const DEFAULT_ECONOMY: Economy = {
  balance: 4820,
  holdings: [],
  transactions: [],
  paidTaxes: [],
  purchases: [],
  welfareFund: 1150,
};

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readMode(): Mode {
  if (typeof window === "undefined") return "teacher";
  const v = window.localStorage.getItem(MODE_KEY);
  return v === "student" || v === "teacher" ? v : "teacher";
}

const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>("teacher");
  const [events, setEvents] = useState<StockEvent[]>([]);
  const [economy, setEconomy] = useState<Economy>(DEFAULT_ECONOMY);

  // hydrate
  useEffect(() => {
    setModeState(readMode());
    setEvents(readJSON<StockEvent[]>(EVENTS_KEY, []));
    setEconomy(readJSON<Economy>(ECONOMY_KEY, DEFAULT_ECONOMY));

    const onStorage = (e: StorageEvent) => {
      if (e.key === MODE_KEY) setModeState(readMode());
      if (e.key === EVENTS_KEY) setEvents(readJSON<StockEvent[]>(EVENTS_KEY, []));
      if (e.key === ECONOMY_KEY) setEconomy(readJSON<Economy>(ECONOMY_KEY, DEFAULT_ECONOMY));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setMode = (m: Mode) => {
    setModeState(m);
    if (typeof window !== "undefined") window.localStorage.setItem(MODE_KEY, m);
  };

  const persistEvents = (next: StockEvent[]) => {
    setEvents(next);
    if (typeof window !== "undefined") window.localStorage.setItem(EVENTS_KEY, JSON.stringify(next));
  };

  const persistEconomy = (updater: (prev: Economy) => Economy) => {
    setEconomy((prev) => {
      const next = updater(prev);
      if (typeof window !== "undefined") window.localStorage.setItem(ECONOMY_KEY, JSON.stringify(next));
      return next;
    });
  };

  const addEvent: Ctx["addEvent"] = (e) =>
    persistEvents([...events, { ...e, id: `evt_${Date.now()}`, createdAt: Date.now() }]);

  const removeEvent = (id: string) => persistEvents(events.filter((e) => e.id !== id));

  const pushTx = (prev: Economy, type: TxType, label: string, signedAmount: number): Transaction => ({
    id: uid(),
    type,
    label,
    amount: signedAmount,
    balanceAfter: prev.balance + signedAmount,
    at: Date.now(),
  });

  const transfer: Ctx["transfer"] = (name, amount) => {
    if (!amount || amount <= 0) return false;
    let ok = false;
    persistEconomy((prev) => {
      if (prev.balance < amount) return prev;
      ok = true;
      const tx = pushTx(prev, "transfer_out", `송금 · ${name}`, -amount);
      return { ...prev, balance: prev.balance - amount, transactions: [tx, ...prev.transactions] };
    });
    return ok;
  };

  const buyStock: Ctx["buyStock"] = (ticker, name, price, shares = 1) => {
    const total = price * shares;
    let ok = false;
    persistEconomy((prev) => {
      if (prev.balance < total) return prev;
      ok = true;
      const idx = prev.holdings.findIndex((h) => h.ticker === ticker);
      let holdings: Holding[];
      if (idx === -1) {
        holdings = [...prev.holdings, { ticker, name, shares, avgPrice: price }];
      } else {
        const h = prev.holdings[idx];
        const newShares = h.shares + shares;
        const newAvg = Math.round((h.avgPrice * h.shares + price * shares) / newShares);
        holdings = [...prev.holdings];
        holdings[idx] = { ...h, shares: newShares, avgPrice: newAvg };
      }
      const tx = pushTx(prev, "stock_buy", `주식 매수 · ${name} ${shares}주`, -total);
      return { ...prev, balance: prev.balance - total, holdings, transactions: [tx, ...prev.transactions] };
    });
    return ok;
  };

  const sellStock: Ctx["sellStock"] = (ticker, price, shares = 1) => {
    const total = price * shares;
    let ok = false;
    persistEconomy((prev) => {
      const idx = prev.holdings.findIndex((h) => h.ticker === ticker);
      if (idx === -1 || prev.holdings[idx].shares < shares) return prev;
      ok = true;
      const h = prev.holdings[idx];
      const newShares = h.shares - shares;
      const holdings = [...prev.holdings];
      if (newShares <= 0) holdings.splice(idx, 1);
      else holdings[idx] = { ...h, shares: newShares };
      const tx = pushTx(prev, "stock_sell", `주식 매도 · ${h.name} ${shares}주`, +total);
      return { ...prev, balance: prev.balance + total, holdings, transactions: [tx, ...prev.transactions] };
    });
    return ok;
  };

  const payTax: Ctx["payTax"] = (name, amount) => {
    let ok = false;
    persistEconomy((prev) => {
      if (prev.paidTaxes.includes(name)) return prev;
      if (prev.balance < amount) return prev;
      ok = true;
      const tx = pushTx(prev, "tax", `세금 납부 · ${name}`, -amount);
      return {
        ...prev,
        balance: prev.balance - amount,
        paidTaxes: [...prev.paidTaxes, name],
        welfareFund: prev.welfareFund + amount,
        transactions: [tx, ...prev.transactions],
      };
    });
    return ok;
  };

  const buyProduct: Ctx["buyProduct"] = (name, price) => {
    let ok = false;
    persistEconomy((prev) => {
      if (prev.balance < price) return prev;
      ok = true;
      const tx = pushTx(prev, "purchase", `상품 구매 · ${name}`, -price);
      return {
        ...prev,
        balance: prev.balance - price,
        purchases: [{ id: uid(), name, price, at: Date.now() }, ...prev.purchases],
        transactions: [tx, ...prev.transactions],
      };
    });
    return ok;
  };

  const resetEconomy = () => persistEconomy(() => DEFAULT_ECONOMY);

  const value = useMemo<Ctx>(
    () => ({
      mode, setMode,
      events, addEvent, removeEvent,
      balance: economy.balance,
      holdings: economy.holdings,
      transactions: economy.transactions,
      paidTaxes: economy.paidTaxes,
      purchases: economy.purchases,
      welfareFund: economy.welfareFund,
      transfer, buyStock, sellStock, payTax, buyProduct, resetEconomy,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, events, economy]
  );

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error("useMode must be used within ModeProvider");
  return { mode: ctx.mode, setMode: ctx.setMode };
}

export function useEvents() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error("useEvents must be used within ModeProvider");
  return { events: ctx.events, addEvent: ctx.addEvent, removeEvent: ctx.removeEvent };
}

export function useEconomy() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error("useEconomy must be used within ModeProvider");
  return {
    balance: ctx.balance,
    holdings: ctx.holdings,
    transactions: ctx.transactions,
    paidTaxes: ctx.paidTaxes,
    purchases: ctx.purchases,
    welfareFund: ctx.welfareFund,
    transfer: ctx.transfer,
    buyStock: ctx.buyStock,
    sellStock: ctx.sellStock,
    payTax: ctx.payTax,
    buyProduct: ctx.buyProduct,
    resetEconomy: ctx.resetEconomy,
  };
}
