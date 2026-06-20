import { useState, type ReactNode } from "react";
import { ShieldCheck, FolderLock, Compass, MapPin, Languages as LangIcon } from "lucide-react";
import { ProfessionalIdentityHeader } from "@/components/vault/professional-identity-header";
import { MembershipBadge, RegionExpertBadge } from "@/components/vault/badges";
import { ShareProfileButton } from "@/components/vault/share-profile-button";
import {
  ProfessionalProfileTabs,
  type ProfileTab,
} from "@/components/vault/professional-profile-tabs";
import { SurfaceCard, InfoPanel } from "@/components/vault/cards";
import { AgentPortfolioCatalog } from "@/components/profile/agent-portfolio-catalog";
import { ProfileContactCard } from "@/components/profile/profile-contact-card";
import type { ProfessionalVM } from "@/lib/profile-vm";

/**
 * Reconnected Lovable profile design fed by REAL data (ProfessionalVM). Shared by
 * /v/$username (public), /dashboard/professionals/$id (in-app, other agent) and
 * /dashboard/profile (own). Only the data-backed sections are shown — Portföyleri
 * + Hakkında tabs, 2 real stats, contact rail. Vision sections (Arayışları, Bölgeler,
 * Benzer, Takipçi/Eşleşme/Analitik, Follow) are intentionally omitted.
 */
export function ProfessionalProfileView({
  vm,
  actions,
  context = "public",
}: {
  vm: ProfessionalVM;
  /** Extra hero actions (e.g. own-profile "Düzenle"/"Önizle"). Share is always shown. */
  actions?: ReactNode;
  /** Portfolio card link target: "app" (in-app pages) or "public" (anon /v). */
  context?: "app" | "public";
}) {
  const [tab, setTab] = useState<ProfileTab>("portfolios");

  return (
    <div className="space-y-6">
      {/* Hero */}
      <SurfaceCard className="group overflow-hidden p-0 pb-5 sm:pb-6">
        <ProfessionalIdentityHeader
          variant="hero"
          name={vm.fullName}
          title={vm.title ?? undefined}
          company={vm.companyName ?? undefined}
          location={vm.location ?? undefined}
          avatarSrc={vm.avatarUrl ?? undefined}
          badges={
            <>
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-medium text-gold ring-1 ring-inset ring-gold/30">
                <ShieldCheck className="size-3.5" /> Doğrulanmış Profesyonel
              </span>
              <MembershipBadge tier={vm.membershipTier} />
              {vm.expertiseRegions.length > 0 && (
                <RegionExpertBadge region={vm.expertiseRegions[0]} />
              )}
            </>
          }
          actions={
            <>
              {actions}
              <ShareProfileButton username={vm.username} />
            </>
          }
        />

        {/* Stats — real only (Aktif Portföy + Uzmanlık Bölgesi) */}
        <div className="mt-5 grid grid-cols-2 gap-2.5 px-5 sm:max-w-sm sm:px-7">
          <Stat icon={FolderLock} label="Aktif Portföy" value={vm.activePortfolios} />
          <Stat icon={Compass} label="Uzmanlık Bölgesi" value={vm.expertiseRegions.length} />
        </div>
      </SurfaceCard>

      {/* Tabs + content + contact rail */}
      <div id="profile-content" className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <ProfessionalProfileTabs
            active={tab}
            onChange={setTab}
            tabs={["portfolios", "about"]}
            counts={{ portfolios: vm.portfolios.length }}
          />
          {tab === "portfolios" ? (
            <AgentPortfolioCatalog portfolios={vm.portfolios} context={context} />
          ) : (
            <AboutPanel vm={vm} />
          )}
        </div>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <ProfileContactCard
            phone={vm.contactPhone}
            email={vm.contactEmail}
            whatsapp={vm.contactWhatsapp}
            location={vm.location}
          />
        </aside>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FolderLock;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 px-3 py-2.5">
      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icon className="size-3.5 text-gold" /> {label}
      </span>
      <span className="mt-0.5 block font-display text-xl font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}

/** "Hakkında" — REAL bio + expertise only (no fabricated socials/languages). */
function AboutPanel({ vm }: { vm: ProfessionalVM }) {
  const hasExpertise = vm.expertiseTypes.length > 0 || vm.expertiseRegions.length > 0;
  return (
    <InfoPanel title="Hakkında" className="self-start">
      {vm.bio ? (
        <p className="text-sm leading-relaxed text-secondary-foreground">{vm.bio}</p>
      ) : (
        <p className="text-sm text-muted-foreground">Henüz bir biyografi eklenmemiş.</p>
      )}
      {hasExpertise && (
        <div className="mt-4 space-y-3">
          {vm.expertiseTypes.length > 0 && (
            <Row icon={LangIcon} label="Uzmanlık">
              {vm.expertiseTypes.join(", ")}
            </Row>
          )}
          {vm.expertiseRegions.length > 0 && (
            <Row icon={MapPin} label="Çalışma Bölgeleri">
              <span className="flex flex-wrap gap-1.5">
                {vm.expertiseRegions.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold ring-1 ring-inset ring-gold/30"
                  >
                    {r}
                  </span>
                ))}
              </span>
            </Row>
          )}
        </div>
      )}
    </InfoPanel>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="mt-0.5 size-4 shrink-0 text-gold" />
      <div className="min-w-0">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <div className="text-secondary-foreground">{children}</div>
      </div>
    </div>
  );
}
