import { Check, AlertTriangle, Sparkles, Send, UserRound, Bookmark } from "lucide-react";
import type { MatchResult } from "@/lib/mock/types";
import { Link } from "@tanstack/react-router";
import { formatPrice, portfolioTypeLabels } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function scoreTone(score: number) {
  if (score >= 85) return "text-success";
  if (score >= 65) return "text-gold";
  return "text-warning";
}

export function MatchExplanationCard({
  match,
  onRequestDetail,
  onSave,
  saved,
}: {
  match: MatchResult;
  onRequestDetail?: (id: string) => void;
  onSave?: (id: string) => void;
  saved?: boolean;
}) {
  const { portfolio: p, score, matched, missing, explanation } = match;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-gradient-surface shadow-elegant transition-colors hover:border-border-strong">
      <div className="flex gap-4 p-4">
        <Link
          to="/p/$slug"
          params={{ slug: p.slug }}
          className="relative size-28 shrink-0 overflow-hidden rounded-xl"
        >
          <img src={p.coverImage} alt={p.title} loading="lazy" className="size-full object-cover" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                to="/p/$slug"
                params={{ slug: p.slug }}
                className="line-clamp-1 font-semibold text-foreground transition-colors hover:text-gold"
              >
                {p.title}
              </Link>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {portfolioTypeLabels[p.type]} · ~{p.regionLabel}
              </p>
              <p className="mt-1 font-display text-lg font-semibold text-gold">
                {formatPrice(p.price, p.currency)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <div className={cn("font-display text-2xl font-bold leading-none", scoreTone(score))}>
                %{score}
              </div>
              <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                Uyum
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Matched / missing */}
      <div className="grid gap-px bg-border sm:grid-cols-2">
        <div className="bg-surface px-4 py-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-success">
            Karşılanan kriterler
          </p>
          <ul className="space-y-1">
            {matched.slice(0, 6).map((m, i) => (
              <li key={i} className="flex items-center gap-1.5 text-xs text-secondary-foreground">
                <Check className="size-3 shrink-0 text-success" /> {m}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-surface px-4 py-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-warning">
            Eksik / kilitli
          </p>
          <ul className="space-y-1">
            {missing.slice(0, 4).map((m, i) => (
              <li key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <AlertTriangle className="size-3 shrink-0 text-warning" /> {m}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* AI explanation */}
      <div className="border-t border-border bg-gold/[0.04] px-4 py-3">
        <p className="flex items-start gap-1.5 text-xs text-secondary-foreground">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-gold" />
          <span>
            <span className="font-semibold text-gold">Asistan: </span>
            {explanation}
          </span>
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 border-t border-border p-3">
        <Button
          size="sm"
          className="flex-1 gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
          onClick={() => onRequestDetail?.(p.id)}
        >
          <Send className="size-3.5" /> Detay Talebi Gönder
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <Link to="/dashboard/professionals/$id" params={{ id: p.owner.id }}>
            <UserRound className="size-3.5" /> Profili Gör
          </Link>
        </Button>
        <Button
          size="sm"
          variant="outline"
          className={cn("gap-1.5", saved && "border-gold/40 text-gold")}
          onClick={() => onSave?.(p.id)}
        >
          <Bookmark className={cn("size-3.5", saved && "fill-current")} />
        </Button>
      </div>
    </div>
  );
}
