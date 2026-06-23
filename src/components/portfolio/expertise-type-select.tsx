import { MultiSelect } from "@/components/ui/multi-select";
import { EXPERTISE_TYPES } from "@/lib/expertise-types";

/**
 * Uzmanlık tipleri picker (Faz 1.6) — composes the shared MultiSelect over the
 * canonical EXPERTISE_TYPES. Emits a string[] for profiles.expertise_types. Reused
 * by profil / arayış / keşfet + profesyoneller filtreleri (Faz 2+). Pure UI.
 */
export function ExpertiseTypeSelect({
  value,
  onChange,
  className,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  className?: string;
}) {
  return (
    <MultiSelect options={EXPERTISE_TYPES} value={value} onChange={onChange} className={className} />
  );
}
