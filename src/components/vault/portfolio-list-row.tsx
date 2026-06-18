import { Link } from "@tanstack/react-router";
import { Eye, Pencil, Share2, MoreVertical, Send, PauseCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Portfolio } from "@/lib/mock/types";
import {
  formatNumber,
  formatPrice,
  portfolioTypeLabels,
  statusLabels,
  statusTones,
} from "@/lib/format";
import { StatusBadge } from "./badges";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PortfolioListRow({ portfolio }: { portfolio: Portfolio }) {
  return (
    <div className="flex items-center gap-4 border-b border-border px-4 py-3 transition-colors last:border-0 hover:bg-surface-2/50">
      <Link to="/p/$slug" params={{ slug: portfolio.slug }} className="shrink-0">
        <img
          src={portfolio.coverImage}
          alt={portfolio.title}
          loading="lazy"
          className="h-14 w-20 rounded-lg object-cover"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <Link to="/p/$slug" params={{ slug: portfolio.slug }}>
          <h4 className="truncate text-sm font-semibold text-foreground hover:text-gold">
            {portfolio.title}
          </h4>
        </Link>
        <p className="truncate text-xs text-muted-foreground">
          {portfolioTypeLabels[portfolio.type]} · {portfolio.regionLabel}
          {portfolio.rooms ? ` · ${portfolio.rooms}` : ""}
          {portfolio.grossM2 ? ` · ${formatNumber(portfolio.grossM2)} m²` : ""}
        </p>
      </div>
      <div className="hidden w-28 text-right md:block">
        <div className="font-display text-base font-semibold text-gold">
          {formatPrice(portfolio.price, portfolio.currency)}
        </div>
      </div>
      <div className="hidden w-24 text-center text-xs text-muted-foreground lg:block">
        <div className="font-medium text-foreground">{formatNumber(portfolio.viewCount)}</div>
        görüntülenme
      </div>
      <div className="hidden w-20 text-center text-xs text-muted-foreground lg:block">
        <div className="font-medium text-foreground">{portfolio.requestCount}</div>
        talep
      </div>
      <div className="w-28 text-center">
        <StatusBadge label={statusLabels[portfolio.status]} tone={statusTones[portfolio.status]} />
      </div>
      <div className="flex items-center gap-1">
        <Button asChild variant="ghost" size="icon" className="size-8">
          <Link to="/dashboard/portfolios/$id" params={{ id: portfolio.id }} aria-label="Görüntüle">
            <Eye className="size-4" />
          </Link>
        </Button>
        <Button asChild variant="ghost" size="icon" className="size-8">
          <Link
            to="/dashboard/portfolios/$id/share"
            params={{ id: portfolio.id }}
            aria-label="Paylaş"
          >
            <Share2 className="size-4" />
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                toast.info("Portföy düzenleme (mock)", { description: portfolio.title })
              }
            >
              <Pencil className="size-4" /> Düzenle
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/dashboard/portfolios/$id/share" params={{ id: portfolio.id }}>
                <Send className="size-4" /> Share Studio
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                toast.success("Portföy pasifleştirildi (mock)", { description: portfolio.title })
              }
            >
              <PauseCircle className="size-4" /> Pasifleştir
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() =>
                toast.error("Portföy silindi (mock)", { description: portfolio.title })
              }
            >
              <Trash2 className="size-4" /> Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
