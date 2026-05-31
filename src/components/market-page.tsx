import { useState } from "react";
import { ShoppingBag, Sparkles, Plus, X, Trash2, CheckCircle2, Wallet } from "lucide-react";
import { useMode, useEconomy } from "@/components/mode-context";
import { useProducts, useUpsertProduct, useDeleteProduct, usePurchaseProduct, type Product } from "@/lib/data/products";

type Draft = {
  id?: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  stock: number;
};

const EMPTY: Draft = { name: "", description: "", price: 100, emoji: "🎁", stock: 10 };

export function MarketPage() {
  const { mode } = useMode();
  const { balance, purchases, buyProduct } = useEconomy();
  const { data: items = [], isLoading, error } = useProducts();
  const upsert = useUpsertProduct();
  const remove = useDeleteProduct();
  const purchase = usePurchaseProduct();
  const [editing, setEditing] = useState<Draft | null>(null);
  const [confirming, setConfirming] = useState<Product | null>(null);
  const [purchasedName, setPurchasedName] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  return (
    <section className="space-y-5">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-bold">
            <ShoppingBag className="size-3.5" /> 학급 마켓
          </div>
          <h2 className="font-display text-3xl mt-2">학급 마켓</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "teacher" ? "교사가 상품과 가격을 관리할 수 있어요." : "L로 특별 권한과 보상을 구매해 보세요."}
          </p>
        </div>
        {mode === "teacher" ? (
          <button
            onClick={() => setEditing(EMPTY)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-full shadow-[0_4px_0_0_oklch(0.55_0.15_240)]"
          >
            <Plus className="size-4" /> 상품 추가
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full">
            <Wallet className="size-4 text-[var(--brand-blue)]" />
            <span className="text-xs text-muted-foreground">잔액</span>
            <span className="font-display text-lg">{balance.toLocaleString()} L</span>
          </div>
        )}
      </header>

      {isLoading && <div className="text-sm text-muted-foreground">불러오는 중…</div>}
      {error && <div className="text-sm text-destructive">상품 정보를 불러오지 못했어요.</div>}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((it: Product) => {
          const soldOut = it.stock <= 0;
          const isStudent = mode === "student";
          const disabled = isStudent && soldOut;
          return (
          <div key={it.id} className="relative rounded-3xl border-2 border-border bg-card p-4 hover:border-accent/40 hover:shadow-md transition-all flex flex-col">
            {mode === "teacher" && (
              <button
                onClick={() => remove.mutate(it.id)}
                className="absolute top-2 right-2 size-7 rounded-full bg-muted hover:bg-destructive hover:text-destructive-foreground grid place-items-center transition-colors"
                aria-label="상품 삭제"
              >
                <Trash2 className="size-3.5" />
              </button>
            )}
            <div className="relative rounded-2xl aspect-square flex items-center justify-center text-5xl"
              style={{ background: "linear-gradient(135deg, color-mix(in oklab, var(--brand-yellow) 45%, white), color-mix(in oklab, var(--brand-orange) 15%, white))" }}>
              {it.emoji}
              {soldOut && (
                <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                  품절
                </span>
              )}
            </div>
            <div className="mt-3 font-display text-lg leading-tight">{it.name}</div>
            <div className="text-[11px] text-muted-foreground line-clamp-2 min-h-[28px]">{it.description}</div>
            <div className="mt-2 flex items-center justify-between">
              <div className="font-display text-xl text-accent">{it.price} <span className="text-xs text-muted-foreground">L</span></div>
              <div className={`text-[10px] font-semibold ${soldOut ? "text-destructive" : "text-muted-foreground"}`}>
                {soldOut ? "품절" : `재고 ${it.stock}개`}
              </div>
            </div>
            <button
              disabled={disabled}
              onClick={() => (mode === "teacher" ? setEditing({ ...it }) : setConfirming(it))}
              className="mt-3 rounded-full bg-primary text-primary-foreground text-xs font-bold py-2 shadow-[0_3px_0_0_oklch(0.55_0.15_240)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {mode === "teacher" ? "수정" : soldOut ? "품절" : "구매하기"}
            </button>
          </div>
          );
        })}
      </div>

      {mode === "teacher" && (
        <div className="rounded-2xl bg-secondary/40 border border-secondary p-4 flex gap-3">
          <Sparkles className="size-5 text-accent shrink-0 mt-0.5" />
          <p className="text-sm text-foreground/80">
            AI 추천: 이번 주는 <strong>저축 캠페인</strong>에 맞춰 '발표 우선권' 가격을 잠깐 10% 인상하는 것을 추천해요.
          </p>
        </div>
      )}

      {editing && (
        <ProductEditor
          product={editing}
          onClose={() => setEditing(null)}
          onSave={async (p) => { await upsert.mutateAsync(p); setEditing(null); }}
        />
      )}

      {confirming && (
        <ConfirmDialog
          title={`${confirming.name}을(를) ${confirming.price}L로 구매하시겠습니까?`}
          onCancel={() => setConfirming(null)}
          onConfirm={async () => {
            const item = confirming;
            setConfirming(null);
            if (balance < item.price) {
              setToast("잔액이 부족해서 구매할 수 없어요.");
              return;
            }
            try {
              await purchase.mutateAsync(item.id);
              const ok = buyProduct(item.name, item.price);
              if (ok) setPurchasedName(item.name);
              else setToast("잔액이 부족해서 구매할 수 없어요.");
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : "";
              setToast(msg.includes("OUT_OF_STOCK") ? "이미 품절된 상품이에요." : "구매에 실패했어요.");
            }
          }}
        />
      )}

      {purchasedName && (
        <SuccessDialog
          message="구매가 완료되었습니다."
          onClose={() => setPurchasedName(null)}
        />
      )}

      {mode === "student" && purchases.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-display text-xl mb-3 flex items-center gap-2">
            <ShoppingBag className="size-5 text-primary" /> 내 구매 내역
          </h3>
          <ul className="space-y-2">
            {purchases.slice(0, 8).map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm border border-border rounded-xl px-3 py-2 bg-muted/20">
                <span className="font-semibold">{p.name}</span>
                <span className="text-[var(--brand-orange)] font-display">-{p.price}L</span>
              </li>
            ))}
          </ul>
        </div>
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

function ConfirmDialog({ title, onConfirm, onCancel }: { title: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onCancel}>
      <div className="bg-card border border-border rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
        <div className="font-display text-lg leading-snug mb-5">{title}</div>
        <div className="flex gap-2 justify-center">
          <button onClick={onCancel} className="rounded-full px-5 py-2 text-sm font-semibold border-2 border-border">
            닫기
          </button>
          <button onClick={onConfirm} className="rounded-full px-5 py-2 text-sm font-bold bg-primary text-primary-foreground shadow-[0_4px_0_0_oklch(0.55_0.15_240)]">
            구매하기
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessDialog({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto size-12 rounded-full bg-primary/10 text-primary grid place-items-center mb-3">
          <CheckCircle2 className="size-6" />
        </div>
        <div className="font-display text-lg mb-5">{message}</div>
        <button onClick={onClose} className="rounded-full px-6 py-2 text-sm font-bold bg-primary text-primary-foreground shadow-[0_4px_0_0_oklch(0.55_0.15_240)]">
          확인
        </button>
      </div>
    </div>
  );
}

function ProductEditor({ product, onSave, onClose }: { product: Draft; onSave: (p: Draft) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<Draft>(product);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-2xl">{product.id ? "상품 수정" : "새 상품 추가"}</h3>
          <button onClick={onClose} className="size-9 rounded-full bg-muted grid place-items-center">
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-3">
          <Row label="상품 이름">
            <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="h-10 w-full rounded-xl border-2 border-border px-3 focus:border-primary focus:outline-none" />
          </Row>
          <Row label="설명">
            <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              rows={2} className="w-full rounded-xl border-2 border-border p-3 focus:border-primary focus:outline-none" />
          </Row>
          <div className="grid grid-cols-3 gap-3">
            <Row label="이모지">
              <input value={draft.emoji} maxLength={4}
                onChange={(e) => setDraft({ ...draft, emoji: e.target.value || "🎁" })}
                className="h-10 w-full rounded-xl border-2 border-border px-3 text-center text-xl focus:border-primary focus:outline-none" />
            </Row>
            <Row label="가격 (L)">
              <input type="number" min={0} value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: Math.max(0, Number(e.target.value) || 0) })}
                className="h-10 w-full rounded-xl border-2 border-border px-3 focus:border-primary focus:outline-none" />
            </Row>
            <Row label="재고">
              <input type="number" min={0} value={draft.stock}
                onChange={(e) => setDraft({ ...draft, stock: Math.max(0, Number(e.target.value) || 0) })}
                className="h-10 w-full rounded-xl border-2 border-border px-3 focus:border-primary focus:outline-none" />
            </Row>
          </div>
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
