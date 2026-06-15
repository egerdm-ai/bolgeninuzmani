import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  ArrowUp,
  Search,
  FolderLock,
  Users,
  FileText,
  Calculator,
  BookmarkPlus,
} from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { BrokerAvatar } from "@/components/vault/broker-avatar";
import { MatchExplanationCard } from "@/components/vault/match-explanation-card";
import { ProfessionalCard } from "@/components/vault/professional-card";
import { SurfaceCard } from "@/components/vault/cards";
import {
  getMatchesForSearch,
  getExpertsForSearch,
} from "@/lib/mock/matching";
import { useSaved } from "@/lib/saved-store";
import { useDetailRequest } from "@/lib/detail-request-store";
import { cn } from "@/lib/utils";
import type { MatchResult, Professional } from "@/lib/mock/types";

export const Route = createFileRoute("/dashboard/assistant")({
  component: Assistant,
});

const quickActions = [
  { label: "Portföyden Arayış Eşleştir", icon: FolderLock },
  { label: "Arayıştan Portföy Bul", icon: Search },
  { label: "Bölge Uzmanı Bul", icon: Users },
  { label: "PDF & Paylaşım Hazırla", icon: FileText },
  { label: "Portföy Değerlemesi Oluştur", icon: Calculator },
];

const promptExamples = [
  "Bodrum'da deniz manzaralı 5+1 villa arıyorum.",
  "Bu portföy hangi arayışlarla eşleşiyor?",
  "Yalıkavak bölgesinde kim uzman?",
  "Bu portföy için teaser PDF hazırla.",
  "Bu portföyün piyasa aralığını yorumla.",
];

type Msg = { role: "user" | "ai"; text: string };

function Assistant() {
  const { isSaved, toggleSave } = useSaved();
  const { open: openRequest } = useDetailRequest();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [experts, setExperts] = useState<Professional[]>([]);
  const started = messages.length > 0;

  const ask = (q: string) => {
    if (!q.trim()) return;
    const query = {
      region: "Bodrum",
      type: "villa" as const,
      budgetMin: 50_000_000,
      budgetMax: 100_000_000,
      rooms: "5+1",
      mustHave: ["Deniz Manzarası", "Havuz"],
    };
    const results = getMatchesForSearch(query);
    const ex = getExpertsForSearch(query);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: q },
      {
        role: "ai",
        text: `Aramanızı analiz ettim. Bu arayış için ${results.length} uygun portföy ve ${ex.length} bölge uzmanı buldum. En güçlü eşleşmeler Yalıkavak ve Türkbükü bölgelerinde.`,
      },
    ]);
    setMatches(results);
    setExperts(ex);
    setInput("");
  };

  return (
    <PageContainer className="h-[calc(100vh-4rem)] !max-w-none !p-0">
      <div className="grid h-full lg:grid-cols-2">
        {/* Chat */}
        <div className="flex h-full flex-col border-r border-border">
          <div className="flex items-center gap-2 border-b border-border px-6 py-4">
            <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-gold text-primary-foreground">
              <Sparkles className="size-5" />
            </span>
            <div>
              <h1 className="font-display text-lg font-semibold text-foreground">VAULT Asistan</h1>
              <p className="text-xs text-muted-foreground">Eşleştirme, değerleme ve paylaşım için akıllı asistan</p>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {!started ? (
              <div className="flex h-full flex-col">
                <div className="text-center">
                  <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                    <Sparkles className="size-7" />
                  </span>
                  <h2 className="mt-4 font-display text-2xl font-semibold text-foreground">Nasıl yardımcı olabilirim?</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Bir işlem seçin veya doğal dille yazın.</p>
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {quickActions.map((a) => (
                    <button
                      key={a.label}
                      onClick={() => ask(a.label)}
                      className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-2 px-3 py-3 text-left text-sm text-secondary-foreground transition-colors hover:border-gold/40 hover:text-foreground"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-gold">
                        <a.icon className="size-4" />
                      </span>
                      <span className="font-medium">{a.label}</span>
                    </button>
                  ))}
                </div>

                <p className="mt-6 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Örnek komutlar
                </p>
                <div className="mt-2 grid gap-2">
                  {promptExamples.map((s) => (
                    <button
                      key={s}
                      onClick={() => ask(s)}
                      className="rounded-xl border border-border bg-surface px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:border-gold/40 hover:text-foreground"
                    >
                      “{s}”
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                  {m.role === "ai" ? (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-gold text-primary-foreground">
                      <Sparkles className="size-4" />
                    </span>
                  ) : (
                    <BrokerAvatar name="Taylan Hersek" size="sm" />
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                      m.role === "user" ? "bg-gold/15 text-foreground" : "bg-surface-2 text-secondary-foreground",
                    )}
                  >
                    {m.text}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-border p-4">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 p-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && ask(input)}
                placeholder="örn. Bodrum'da deniz manzaralı 5+1 villa arıyorum..."
                className="flex-1 bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <Button
                size="icon"
                onClick={() => ask(input)}
                className="size-9 shrink-0 bg-gradient-gold text-primary-foreground hover:opacity-90"
              >
                <ArrowUp className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="h-full overflow-y-auto bg-surface/30 p-6">
          {matches.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <Sparkles className="size-8 text-gold/50" />
              <p className="mt-3 text-sm">Eşleşmeler ve içgörüler burada görünecek</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Eşleşen Portföyler</h2>
                <div className="space-y-4">
                  {matches.slice(0, 4).map((m) => (
                    <MatchExplanationCard
                      key={m.portfolio.id}
                      match={m}
                      saved={isSaved(m.portfolio.id)}
                      onSave={toggleSave}
                      onRequestDetail={openRequest}
                    />
                  ))}
                </div>
              </div>

              {experts.length > 0 && (
                <div>
                  <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Bölge Uzmanları</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {experts.slice(0, 2).map((b) => (
                      <ProfessionalCard key={b.id} professional={b} compact />
                    ))}
                  </div>
                </div>
              )}

              <SurfaceCard className="space-y-3 border-gold/30 bg-gold/[0.05]">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-gold text-primary-foreground">
                    <BookmarkPlus className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">Bu aramayı arayış olarak kaydet</p>
                    <p className="text-xs text-muted-foreground">Yeni eşleşen portföylerde bildirim alın.</p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-3 py-2">
                  <span className="flex items-center gap-2 text-sm text-secondary-foreground">
                    <Bell className="size-4 text-gold" /> Yeni eşleşmelerde bildir
                  </span>
                  <Switch checked={notifyOnMatch} onCheckedChange={setNotifyOnMatch} />
                </div>
                <Button
                  onClick={() =>
                    toast.success("Arayış olarak kaydedildi", {
                      description: notifyOnMatch
                        ? "Yeni eşleşmelerde bildirim alacaksınız."
                        : "Bildirimler kapalı olarak kaydedildi.",
                    })
                  }
                  className="w-full shrink-0 gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
                >
                  <BookmarkPlus className="size-4" /> Arayış Olarak Kaydet
                </Button>
              </SurfaceCard>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
