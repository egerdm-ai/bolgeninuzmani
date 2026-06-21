import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  Loader2,
  Check,
  X,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  Inbox,
  UserCheck,
} from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyStateCard } from "@/components/vault/cards";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import {
  listPendingProfiles,
  listApplications,
  setProfileStatus,
  type PendingProfile,
  type Application,
} from "@/lib/data/admin";

export const Route = createFileRoute("/dashboard/admin")({
  // Server-validated admin gate (am_i_admin RPC checks the CALLER). Non-admins (incl.
  // anon) → redirect. The admin_set_profile_status RPC re-validates on every write.
  beforeLoad: async () => {
    const { data, error } = await supabase.rpc("am_i_admin");
    if (error || data !== true) throw redirect({ to: "/dashboard" });
  },
  component: AdminPage,
});

const trDate = (iso: string) => new Date(iso).toLocaleDateString("tr-TR");

function AdminPage() {
  const [tab, setTab] = useState<"pending" | "applications">("pending");

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Yönetim" subtitle="Emlakçı doğrulama ve başvuru yönetimi." />

      <div className="flex gap-2">
        <TabButton active={tab === "pending"} onClick={() => setTab("pending")} icon={UserCheck}>
          Bekleyen Emlakçılar
        </TabButton>
        <TabButton
          active={tab === "applications"}
          onClick={() => setTab("applications")}
          icon={Inbox}
        >
          Lead Başvuruları
        </TabButton>
      </div>

      {tab === "pending" ? <PendingTab /> : <ApplicationsTab />}
    </PageContainer>
  );
}

function PendingTab() {
  const [rows, setRows] = useState<PendingProfile[] | null>(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => {
    setRows(null);
    setError(false);
    listPendingProfiles()
      .then(setRows)
      .catch(() => setError(true));
  };
  useEffect(load, []);

  async function act(p: PendingProfile, status: "verified" | "suspended") {
    setBusy(p.id);
    try {
      await setProfileStatus(p.id, status);
      setRows((rs) => (rs ? rs.filter((r) => r.id !== p.id) : rs));
      toast.success(
        status === "verified" ? `${p.full_name} onaylandı.` : `${p.full_name} reddedildi.`,
      );
    } catch (e) {
      toast.error("İşlem başarısız", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(null);
    }
  }

  if (error)
    return (
      <EmptyStateCard
        icon={X}
        title="Yüklenemedi"
        description="Bekleyen emlakçılar getirilemedi."
      />
    );
  if (rows === null) return <LoadingBox />;
  if (rows.length === 0)
    return (
      <EmptyStateCard
        icon={UserCheck}
        title="Bekleyen başvuru yok"
        description="Şu an doğrulama bekleyen emlakçı bulunmuyor."
      />
    );

  return (
    <div className="space-y-4">
      {rows.map((p) => (
        <div key={p.id} className="rounded-2xl border border-border bg-surface p-5 shadow-elegant">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {p.full_name}
                </h3>
                <span className="text-sm text-muted-foreground">@{p.username}</span>
              </div>
              {(p.title || p.company_name) && (
                <p className="text-sm text-secondary-foreground">
                  {[p.title, p.company_name].filter(Boolean).join(" · ")}
                </p>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {p.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3 text-gold" /> {p.location}
                  </span>
                )}
                {p.contact_phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="size-3 text-gold" /> {p.contact_phone}
                  </span>
                )}
                {p.contact_email && (
                  <span className="flex items-center gap-1">
                    <Mail className="size-3 text-gold" /> {p.contact_email}
                  </span>
                )}
                {p.contact_whatsapp && (
                  <span className="flex items-center gap-1">
                    <MessageCircle className="size-3 text-gold" /> {p.contact_whatsapp}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="size-3" /> {trDate(p.created_at)}
                </span>
              </div>
              {(p.expertise_regions.length > 0 || p.expertise_types.length > 0) && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[...p.expertise_regions, ...p.expertise_types].map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-secondary-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {p.bio && <p className="max-w-2xl pt-1 text-sm text-muted-foreground">{p.bio}</p>}
            </div>

            <div className="flex shrink-0 gap-2">
              <Button
                size="sm"
                className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
                disabled={busy === p.id}
                onClick={() => act(p, "verified")}
              >
                {busy === p.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Check className="size-4" />
                )}
                Onayla
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
                disabled={busy === p.id}
                onClick={() => act(p, "suspended")}
              >
                <X className="size-4" /> Reddet
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ApplicationsTab() {
  const [rows, setRows] = useState<Application[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    listApplications()
      .then(setRows)
      .catch(() => setError(true));
  }, []);

  if (error)
    return <EmptyStateCard icon={X} title="Yüklenemedi" description="Başvurular getirilemedi." />;
  if (rows === null) return <LoadingBox />;
  if (rows.length === 0)
    return (
      <EmptyStateCard
        icon={Inbox}
        title="Başvuru yok"
        description="Landing formundan henüz başvuru gelmemiş."
      />
    );

  return (
    <div className="space-y-3">
      {rows.map((a) => (
        <div key={a.id} className="rounded-2xl border border-border bg-surface p-4 shadow-elegant">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">{a.full_name}</h3>
                {a.company && <span className="text-xs text-muted-foreground">· {a.company}</span>}
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {a.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Phone className="size-3 text-gold" /> {a.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="size-3 text-gold" /> {a.email}
                </span>
                {a.regions.length > 0 && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3 text-gold" /> {a.regions.join(", ")}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="size-3" /> {trDate(a.created_at)}
                </span>
              </div>
              {a.message && (
                <p className="max-w-2xl pt-1 text-sm text-muted-foreground">{a.message}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof ShieldCheck;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "border-gold/40 bg-gold/10 text-gold"
          : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-4" /> {children}
    </button>
  );
}

function LoadingBox() {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-border bg-surface py-16">
      <Loader2 className="size-6 animate-spin text-gold" />
    </div>
  );
}
