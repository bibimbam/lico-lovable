import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot, User as UserIcon, Paperclip, Rocket } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { cn } from "@/lib/utils";
import { useMode } from "@/components/mode-context";
import { askSolar } from "@/lib/upstage.functions";
import { supabase } from "@/integrations/supabase/client";

type LessonCard = {
  today_topic: string;
  summary_for_kids: string;
  keywords: string;
};

type Msg = {
  role: "user" | "assistant";
  content: string;
  deployable?: boolean;
  lessonCard?: LessonCard;
};

// n8n Webhook URL for lesson-plan (교안) analysis.
const LESSON_ANALYSIS_WEBHOOK_URL = "https://haewha.app.n8n.cloud/webhook/hackathon13";

function renderInline(text: string, keyPrefix: string) {
  // Split by **bold** while keeping delimiters
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return (
        <strong key={`${keyPrefix}-b-${i}`} className="font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyPrefix}-t-${i}`}>{part}</span>;
  });
}

function MarkdownMessage({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        const h3 = line.match(/^###\s+(.*)$/);
        if (h3) {
          return (
            <h3 key={i} className="text-base font-bold mt-2 mb-1 text-primary">
              {renderInline(h3[1], `h3-${i}`)}
            </h3>
          );
        }
        const h2 = line.match(/^##\s+(.*)$/);
        if (h2) {
          return (
            <h3 key={i} className="text-base font-bold mt-2 mb-1 text-primary">
              {renderInline(h2[1], `h2-${i}`)}
            </h3>
          );
        }
        if (line.trim() === "") {
          return <div key={i} className="h-2" />;
        }
        return <p key={i}>{renderInline(line, `p-${i}`)}</p>;
      })}
    </>
  );
}

const TEACHER_SUGGESTED = [
  "우리 반에 어울리는 새 직업을 추천해줘",
  "소득세를 조정할 때 어떤 점을 고려해야 해?",
  "보상 체계를 어떻게 개선할 수 있을까?",
  "학생 참여도를 높일 이벤트 아이디어 줘",
  "이번 주 경제 이벤트를 만들어줘",
];

const STUDENT_SUGGESTED = [
  "세금은 왜 내나요?",
  "주식은 무엇인가요?",
  "저축과 투자의 차이는 무엇인가요?",
  "물가는 왜 오르나요?",
  "경제가 무엇인가요?",
];

const TEACHER_SEED: Msg[] = [
  {
    role: "assistant",
    content:
      "안녕하세요 선생님! 저는 리코 AI 어시스턴트예요. 교실 경제 운영을 함께 고민해드릴게요. 무엇을 도와드릴까요?",
  },
];

const STUDENT_SEED: Msg[] = [
  {
    role: "assistant",
    content:
      "안녕! 나는 리코의 금융경제 선생님이야 \n🌟 세금, 주식, 저축처럼 어려워 보이는 경제 이야기를 쉽게 알려줄게. 궁금한 걸 무엇이든 물어봐!",
  },
];

const TEACHER_SYSTEM =
  "당신은 한국 초등학교 교실 경제 시뮬레이션 '리코(LICO)'의 교사용 AI 코티칭 어시스턴트입니다. 교사가 학급 경제(직업, 급여, 세금, 보상, 이벤트, 참여도 등)를 운영하는 것을 돕습니다. 친절하고 구체적이며 실행 가능한 한국어로 답하세요.";

const STUDENT_SYSTEM =
  "당신은 한국 초등학생을 위한 '리코(LICO)' 금융경제 선생님입니다. 세금·주식·저축·물가·경제 같은 개념을 초등학생 눈높이에 맞춰 아주 쉽고 친근하게, 짧은 예시와 이모지를 곁들여 한국어로 설명하세요.";

export function AiAssistantPage() {
  const { mode } = useMode();
  const isStudent = mode === "student";
  const seed = isStudent ? STUDENT_SEED : TEACHER_SEED;
  const suggested = isStudent ? STUDENT_SUGGESTED : TEACHER_SUGGESTED;

  const [messages, setMessages] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ask = useServerFn(askSolar);

  useEffect(() => {
    setMessages(seed); /* reset on mode switch */
  }, [mode]); // eslint-disable-line
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const extractLessonCard = (payload: any): LessonCard | null => {
    if (!payload) return null;
    const p = Array.isArray(payload) ? payload[0] : payload;
    const body = p?.body ?? p;
    const today_topic = body?.today_topic ?? body?.topic ?? "";
    const summary_for_kids = body?.summary_for_kids ?? body?.summary ?? "";
    const keywords = body?.keywords ?? "";
    if (!today_topic && !summary_for_kids && !keywords) return null;
    return {
      today_topic: String(today_topic),
      summary_for_kids: String(summary_for_kids),
      keywords: Array.isArray(keywords) ? keywords.join(", ") : String(keywords),
    };
  };

  const uploadFileAndAnalyze = async (file: File): Promise<LessonCard | null> => {
    // 1) Upload file to Supabase storage to get a public URL
    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("lesson-uploads")
      .upload(path, file, { contentType: file.type || undefined, upsert: false });
    if (upErr) throw upErr;
    const { data: pub } = supabase.storage.from("lesson-uploads").getPublicUrl(path);
    const file_url = pub.publicUrl;

    // 2) POST JSON { file_url } to n8n webhook
    const res = await fetch(LESSON_ANALYSIS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_url }),
    });
    if (!res.ok) throw new Error(`n8n error ${res.status}`);
    const raw = await res.text();
    let data: any = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = raw;
    }
    return extractLessonCard(data);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || analyzing || loading) return;
    setMessages((m) => [
      ...m,
      { role: "user", content: `📎 교안 파일 업로드: ${file.name}` },
      { role: "assistant", content: "교안 파일을 분석하고 있습니다... ⏳" },
    ]);
    setAnalyzing(true);
    try {
      const card = await uploadFileAndAnalyze(file);
      setMessages((m) => {
        const copy = [...m];
        copy.pop();
        if (card) {
          copy.push({
            role: "assistant",
            content: "오늘의 경제 요약 카드를 만들었어요! ✨",
            deployable: true,
            lessonCard: card,
          });
        } else {
          copy.push({ role: "assistant", content: "교안 분석 결과를 받지 못했어요." });
        }
        return copy;
      });
    } catch (err) {
      console.error(err);
      setMessages((m) => {
        const copy = [...m];
        copy.pop();
        copy.push({ role: "assistant", content: "죄송해요, 교안 분석에 실패했어요. 잠시 후 다시 시도해주세요." });
        return copy;
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeploy = (content: string) => {
    alert("오늘의 경제 지식으로 배포되었어요! 🚀");
    console.log("[Deploy 오늘의 경제 지식]", content);
  };

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const result = await ask({
        data: {
          system: isStudent ? STUDENT_SYSTEM : TEACHER_SYSTEM,
          messages: next,
        },
      });
      const assistantContent = result.content;

      setMessages((m) => [...m, { role: "assistant", content: assistantContent }]);
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "죄송해요, 답변을 가져오지 못했어요. 잠시 후 다시 시도해주세요." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      <header>
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
          <Sparkles className="size-3.5" /> AI 어시스턴트
        </div>
        <h2 className="font-display text-3xl mt-2">{isStudent ? "친절한 금융경제 선생님" : "교실 경제 코티칭 봇"}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isStudent
            ? "세금·주식·저축처럼 어려운 경제 개념을 쉽고 친절하게 설명해 줘요."
            : "교실 운영의 모든 고민을 함께 풀어드리는 AI 동료예요."}
        </p>
      </header>

      <div className="flex-1 rounded-3xl border border-border bg-card overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto p-5 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
              <div
                className={cn(
                  "size-9 rounded-full grid place-items-center shrink-0",
                  m.role === "user" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground",
                )}
              >
                {m.role === "user" ? <UserIcon className="size-4" /> : <Bot className="size-4" />}
              </div>
              <div className={cn("max-w-[75%] flex flex-col gap-2", m.role === "user" && "items-end")}>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm",
                  )}
                >
                  {m.role === "assistant" ? <MarkdownMessage content={m.content} /> : m.content}
                </div>
                {m.role === "assistant" && m.lessonCard && (
                  <div className="self-start w-full rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-card to-accent/10 p-5 shadow-[0_4px_0_0_oklch(0.85_0.05_240)] space-y-4">
                    <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[11px] font-bold">
                      <Sparkles className="size-3" /> 오늘의 경제 요약 카드
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-muted-foreground mb-1">🌟 오늘의 주제</div>
                      <div className="text-base font-bold text-foreground">{m.lessonCard.today_topic}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-muted-foreground mb-1">📝 어린이 눈높이 요약</div>
                      <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {m.lessonCard.summary_for_kids}
                      </p>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-muted-foreground mb-1.5">🔑 핵심 키워드</div>
                      <div className="flex flex-wrap gap-1.5">
                        {m.lessonCard.keywords
                          .split(/[,，、]/)
                          .map((k) => k.trim())
                          .filter(Boolean)
                          .map((k, idx) => (
                            <span
                              key={idx}
                              className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent text-accent-foreground"
                            >
                              {k}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
                {m.role === "assistant" && m.deployable && (
                  <button
                    onClick={() => handleDeploy(m.content)}
                    className="self-start inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 shadow-[0_3px_0_0_oklch(0.45_0.18_300)] transition-colors"
                  >
                    <Rocket className="size-3.5" /> 오늘의 경제 지식으로 배포하기 🚀
                  </button>
                )}
              </div>
            </div>
          ))}
          {(loading || analyzing) && (
            <div className="flex gap-3">
              <div className="size-9 rounded-full grid place-items-center shrink-0 bg-primary text-primary-foreground">
                <Bot className="size-4" />
              </div>
              <div className="max-w-[75%] rounded-2xl px-4 py-3 text-sm bg-muted text-muted-foreground rounded-tl-sm">
                {analyzing
                  ? "교안 파일을 분석하고 있습니다... ⏳"
                  : isStudent
                    ? "AI 교사 선생님이 답변을 생각하고 있어요..."
                    : "답변을 생각하고 있어요…"}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {messages.length <= 2 && (
          <div className="px-5 pb-3">
            <div className="text-[11px] font-bold text-muted-foreground mb-2">추천 질문</div>
            <div className="flex flex-wrap gap-2">
              {suggested.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  disabled={loading}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:scale-[1.02] transition-transform disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-border p-3 flex gap-2 items-center">
          {!isStudent && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.ppt,.pptx,.hwp,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || analyzing}
                title="교안 파일 업로드 (PDF, PPT, HWP)"
                className="size-12 rounded-2xl bg-muted text-muted-foreground grid place-items-center hover:bg-muted/70 hover:text-foreground transition-colors disabled:opacity-50"
              >
                <Paperclip className="size-5" />
              </button>
            </>
          )}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder={isStudent ? "예) 세금은 왜 내나요?" : "예) 우리 반 참여도를 어떻게 높일까?"}
            disabled={loading || analyzing}
            className="flex-1 h-12 rounded-2xl bg-muted px-4 outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
          />
          <button
            onClick={() => send(input)}
            disabled={loading || analyzing}
            className="size-12 rounded-2xl bg-primary text-primary-foreground grid place-items-center shadow-[0_4px_0_0_oklch(0.55_0.15_240)] disabled:opacity-50"
          >
            <Send className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
