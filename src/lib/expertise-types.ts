// Canonical uzmanlık tipleri (Faz 1.6). Stored in profiles.expertise_types
// (text[]) and reused by profil / arayış / keşfet + profesyoneller filtreleri
// (Faz 2+). value === label (Turkish) so the stored strings stay readable and DB
// matching is a plain equality — no migration of existing expertise_types.
//
// "Ticari" is kept as one type for now; the plan notes it is sub-dividable later.

export type ExpertiseType = { value: string; label: string };

const e = (label: string): ExpertiseType => ({ value: label, label });

export const EXPERTISE_TYPES: ExpertiseType[] = [
  "Konut",
  "Ticari",
  "Arsa",
  "Vatandaşlık",
  "Golden Visa",
  "Yurtdışı Yatırımları",
].map(e);
