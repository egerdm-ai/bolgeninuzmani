import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Send, ArrowUp, MapPin, TrendingUp, BookmarkPlus, Building2, Activity } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { BrokerAvatar } from "@/components/vault/broker-avatar";
import { PortfolioPreviewCard } from "@/components/vault/portfolio-preview-card";
import { ProfessionalCard } from "@/components/vault/professional-card";
import { DetailRequestModal } from "@/components/vault/detail-request-modal";
import { SurfaceCard } from "@/components/vault/cards";
import { conciergeSuggestions, portfolios, professionals } from "@/lib/mock/data";
import { useSaved } from "@/lib/saved-store";
import { cn } from "@/lib/utils";
import type { Portfolio } from "@/lib/mock/types";

export const Route = createFileRoute("/dashboard/concierge")({
  component: Concierge,
});

type Msg = { role: "user" | "ai"; text: string };

function Concierge() {
  const { isSaved, toggleSave } = useSaved();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [criteria, setCriteria] = useState<string[]>([]);
  const [results, setResults] = useState<Portfolio[]>([]);
  const [requestTarget, setRequestTarget] = useState<Portfolio | null>(null);
  const started = messages.length > 0;

  const ask = (q: string) => {
    if (!q.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text: q },
      {
        role: "ai",
        text: "Aramanızı analiz ettim. Bodrum bölgesinde, deniz manzaralı ve bütçenize uygun 3 portföy ve ilgili 2 uzman buldum.",
      },
    ]);
    setCriteria(["Bodrum", "Villa", "Deniz Manzarası", "100M TL altı", "5+1"]);
    setResults(portfolios.filter((p) => p.status === "active").slice(0, 3));
    setInput("");
  };

  return (
    <PageContainer className="h-[calc(100vh-4rem)] !max-w-none !p-0">
      <div className="grid h-full lg:grid-cols-2">
        {/* Chat */}
        <div className="flex h-full flex-col border-r border-border">
          <div className="flex items-center gap-2 border-b border-border px-6 py-4">
            <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-gold text-primary-foreground"><Sparkles className="size-5" /></span>
            <div>
              <h1 className="font-display text-lg font-semibold text-foreground">AI Concierge</h1>
              <p className="text-xs text-muted-foreground">Doğal dille portföy ve uzman arayın</p>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {!started ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-gold/10 text-gold"><Sparkles className="size-7" /></span>
                <h2 className="mt-4 font-display text-2xl font-semibold text-foreground">Nasıl yardımcı olabilirim?</h2>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">Aradığınız portföyü doğal dille tarif edin. Örnek aramalardan başlayabilirsiniz.</p>
                <div className="mt-5 grid w-full max-w-md gap-2">
                  {conciergeSuggestions.map((s) => (
                    <button key={s} onClick={() => ask(s)} className="rounded-xl border border-border bg-surface-2 px-4 py-3 text-left text-sm text-secondary-foreground transition-colors hover:border-gold/40 hover:text-foreground">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                  {m.role === "ai" ? (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-gold text-primary-foreground"><Sparkles className="size-4" /></span>
                  ) : (
                    <BrokerAvatar name="Taylan Hersek" size="sm" />
                  )}
                  <div className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm", m.role === "user" ? "bg-gold/15 text-foreground" : "bg-surface-2 text-secondary-foreground")}>
                    {m.text}
                  </div>
                </div>
              ))
            )}
            {criteria.length > 0 && (
              <div className="rounded-xl border border-gold/30 bg-gold/[0.05] p-3">
                <p className="text-xs font-semibold text-gold">Çıkarılan Kriterler</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {criteria.map((c) => (
                    <span key={c} className="rounded-md bg-gold/15 px-2 py-0.5 text-xs text-gold">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border p-4">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 p-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && ask(input)}
                placeholder="örn. Bodrum'da deniz manzaralı 5+1 villa..."
                className="flex-1 bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <Button size="icon" onClick={() => ask(input)} className="size-9 shrink-0 bg-gradient-gold text-primary-foreground hover:opacity-90">
                <ArrowUp className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="h-full overflow-y-auto bg-surface/30 p-6">
          {results.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <Send className="size-8 text-gold/50" />
              <p className="mt-3 text-sm">Sonuçlar burada görünecek</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Eşleşen Portföyler</h2>
                <div className="space-y-4">
                  {results.map((p) => (
                    <PortfolioPreviewCard key={p.id} portfolio={p} saved={isSaved(p.id)} onToggleSave={toggleSave} onRequestDetail={setRequestTarget} />
                  ))}
                </div>
              </div>
              <div>
                <h2 className="mb-3 font-display text-lg font-semibold text-foreground">İlgili Uzmanlar</h2>
                <div className="space-y-3">
                  {professionals.slice(1, 3).map((b) => (
                    <SurfaceCard key={b.id} className="flex items-center gap-3 p-3">
                      <BrokerAvatar name={b.fullName} size="lg" />
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1 font-semibold text-foreground">{b.fullName} <ShieldCheck className="size-3.5 text-gold" /></p>
                        <p className="truncate text-xs text-muted-foreground">{b.title} · {b.companyName}</p>
                        <p className="flex items-center gap-1 text-xs text-gold"><MapPin className="size-3" /> {b.expertiseRegions.join(", ")}</p>
                      </div>
                      <Button variant="outline" size="sm">Profil</Button>
                    </SurfaceCard>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <DetailRequestModal portfolio={requestTarget} open={!!requestTarget} onOpenChange={(o) => !o && setRequestTarget(null)} />
    </PageContainer>
  );
}
