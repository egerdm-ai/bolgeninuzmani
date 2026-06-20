import { useEffect, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { PortfolioTeaserCard, type TeaserCardData } from "@/components/portfolio/teaser-card";
import { matchSearch, type MatchResult } from "@/lib/data/matches";
import { publicTeaserImageUrl, publicTeaserThumbUrl } from "@/lib/data/public-portfolio";

const toCard = (m: MatchResult): TeaserCardData => ({
  id: m.id,
  slug: m.slug,
  title: m.title,
  price: m.price,
  currency: m.currency,
  transaction_type: m.transaction_type,
  category: m.category,
  mode: m.mode,
  ref_no: m.ref_no,
  city: m.city,
  district: m.district,
  neighborhood: m.neighborhood,
  coverThumb: m.cover_path ? publicTeaserThumbUrl(m.cover_path) : null,
  coverFull: m.cover_path ? publicTeaserImageUrl(m.cover_path) : null,
  agent: m.agent,
});

/**
 * Auto-loads TEASER matches for a search (match_search RPC) and renders them as the
 * shared PortfolioTeaserCard (→ /p public teaser) with a small "uyum" score pill.
 * Teaser-only — the RPC never returns a locked field.
 */
export function MatchResults({ searchId }: { searchId: string }) {
  const [matches, setMatches] = useState<MatchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setMatches(null);
    setError(null);
    matchSearch(searchId)
      .then((r) => active && setMatches(r))
      .catch((e) => active && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      active = false;
    };
  }, [searchId]);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="size-5 text-gold" />
        <h2 className="font-display text-xl font-semibold text-foreground">Eşleşen Portföyler</h2>
        {matches && matches.length > 0 && (
          <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold ring-1 ring-inset ring-gold/30">
            {matches.length}
          </span>
        )}
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-10 text-center text-sm text-destructive">
          Eşleşmeler yüklenemedi: {error}
        </div>
      ) : matches === null ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-surface py-12">
          <Loader2 className="size-6 animate-spin text-gold" />
        </div>
      ) : matches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface/50 px-6 py-12 text-center text-sm text-muted-foreground">
          Bu arayışa uygun aktif portföy bulunamadı. Kriterleri genişletmeyi deneyin.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {matches.map((m) => (
            <div key={m.id} className="relative">
              {m.score > 0 && (
                <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-gradient-gold px-2 py-0.5 text-[11px] font-bold text-primary-foreground shadow-gold">
                  <Sparkles className="size-3" /> +{m.score} kriter
                </span>
              )}
              <PortfolioTeaserCard p={toCard(m)} context="public" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
