import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Constants } from "@/lib/database.types";
import { CATEGORY_LABELS, TRANSACTION_LABELS } from "@/lib/portfolio-labels";
import type { SearchInput } from "@/lib/data/searches";
import type { Search } from "@/lib/data/searches";

const CATEGORIES = Constants.public.Enums.portfolio_category;
const TRANSACTIONS = Constants.public.Enums.transaction_type;
const CURRENCIES = Constants.public.Enums.currency;
const URGENCIES = Constants.public.Enums.search_urgency;
const ROOMS = ["1+0", "1+1", "2+1", "3+1", "4+1", "5+1", "6+1"];
const URGENCY_LABEL: Record<string, string> = { low: "Düşük", medium: "Orta", high: "Yüksek" };

const numOrNull = (v: string) => (v.trim() === "" ? null : Number(v));

export function SearchForm({
  initial,
  submitting,
  submitLabel,
  onSubmit,
}: {
  initial?: Search;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (input: SearchInput) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState(initial?.category ?? "konut");
  const [transaction, setTransaction] = useState(initial?.transaction_type ?? "satilik");
  const [city, setCity] = useState(initial?.city ?? "");
  const [district, setDistrict] = useState(initial?.district ?? "");
  const [neighborhood, setNeighborhood] = useState(initial?.neighborhood ?? "");
  const [budgetMin, setBudgetMin] = useState(initial?.budget_min?.toString() ?? "");
  const [budgetMax, setBudgetMax] = useState(initial?.budget_max?.toString() ?? "");
  const [currency, setCurrency] = useState(initial?.currency ?? "TRY");
  const [rooms, setRooms] = useState(initial?.room_count ?? "");
  const [minM2, setMinM2] = useState(initial?.min_m2?.toString() ?? "");
  const [urgency, setUrgency] = useState(initial?.urgency ?? "medium");
  const [features, setFeatures] = useState((initial?.features ?? []).join(", "));
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: title.trim(),
      category,
      transaction_type: transaction,
      city: city.trim() || null,
      district: district.trim() || null,
      neighborhood: neighborhood.trim() || null,
      budget_min: numOrNull(budgetMin),
      budget_max: numOrNull(budgetMax),
      currency,
      room_count: rooms || null,
      min_m2: minM2.trim() === "" ? null : Number(minM2),
      features: features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
      urgency,
      notes: notes.trim() || null,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field label="Arayış Başlığı">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Örn. Deniz manzaralı 3+1 villa"
          required
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Kategori">
          <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="İşlem">
          <Select
            value={transaction}
            onValueChange={(v) => setTransaction(v as typeof transaction)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRANSACTIONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {TRANSACTION_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Şehir">
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="İstanbul" />
        </Field>
        <Field label="İlçe">
          <Input
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="Sarıyer"
          />
        </Field>
        <Field label="Mahalle">
          <Input
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            placeholder="Bebek"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Min. Bütçe">
          <Input
            type="number"
            value={budgetMin}
            onChange={(e) => setBudgetMin(e.target.value)}
            placeholder="0"
          />
        </Field>
        <Field label="Max. Bütçe">
          <Input
            type="number"
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
            placeholder="0"
          />
        </Field>
        <Field label="Para Birimi">
          <Select value={currency} onValueChange={(v) => setCurrency(v as typeof currency)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Oda">
          <Select value={rooms || "any"} onValueChange={(v) => setRooms(v === "any" ? "" : v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Farketmez</SelectItem>
              {ROOMS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Min. m²">
          <Input
            type="number"
            value={minM2}
            onChange={(e) => setMinM2(e.target.value)}
            placeholder="0"
          />
        </Field>
        <Field label="Aciliyet">
          <Select value={urgency} onValueChange={(v) => setUrgency(v as typeof urgency)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {URGENCIES.map((u) => (
                <SelectItem key={u} value={u}>
                  {URGENCY_LABEL[u]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Özellikler (virgülle ayırın)">
        <Input
          value={features}
          onChange={(e) => setFeatures(e.target.value)}
          placeholder="deniz manzarası, havuz, otopark"
        />
      </Field>

      <Field label="Notlar">
        <Textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Müşterinin ek beklentileri…"
        />
      </Field>

      <Button
        type="submit"
        disabled={submitting || title.trim() === ""}
        className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
      >
        {submitting && <Loader2 className="size-4 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
