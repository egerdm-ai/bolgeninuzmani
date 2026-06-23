// Canonical "genel özellikler / nitelikler" list (Faz 1.4) — replaces the
// "virgülle yaz" free-text box with a grouped multi-select (Sahibinden-style
// İç/Dış/Muhit/Manzara sets). These live in portfolios.features (text[] teaser
// column), NOT the attribute registry (see portfolio-attributes.ts header).
//
// value === label (Turkish string) ON PURPOSE: features[] is a free-text array and
// the Keşfet quick-chip filter matches by exact string (.contains), e.g. "Havuz",
// "Otopark", "Deniz Manzarası". Keeping value === label means existing stored
// values + filters keep working with no data migration.

export type FeatureOption = { value: string; label: string };
export type FeatureGroup = { id: string; label: string; options: FeatureOption[] };

const opt = (label: string): FeatureOption => ({ value: label, label });

export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    id: "ic",
    label: "İç Özellikler",
    options: [
      "Ankastre Mutfak",
      "Beyaz Eşya",
      "Klima",
      "Akıllı Ev",
      "Çelik Kapı",
      "Görüntülü Diyafon",
      "Şömine",
      "Gömme Dolap",
      "Giyinme Odası",
      "Duşakabin",
      "Jakuzi",
      "Ebeveyn Banyosu",
      "Laminat Zemin",
      "Parke Zemin",
      "Seramik Zemin",
      "Fiber İnternet",
      "Boyalı",
      "Vestiyer",
    ].map(opt),
  },
  {
    id: "dis",
    label: "Dış Özellikler",
    options: [
      "Havuz",
      "Kapalı Havuz",
      "Otopark",
      "Kapalı Otopark",
      "Bahçe",
      "Teras",
      "Balkon",
      "Asansör",
      "Güvenlik",
      "Jeneratör",
      "Site İçi",
      "Spor Alanı",
      "Çocuk Parkı",
      "Barbekü",
    ].map(opt),
  },
  {
    id: "muhit",
    label: "Muhit",
    options: [
      "Denize Yakın",
      "Metroya Yakın",
      "Okula Yakın",
      "AVM'ye Yakın",
      "Hastaneye Yakın",
      "Park Yakını",
      "Sahil",
    ].map(opt),
  },
  {
    id: "manzara",
    label: "Manzara",
    options: [
      "Deniz Manzarası",
      "Boğaz Manzarası",
      "Doğa Manzarası",
      "Şehir Manzarası",
      "Göl Manzarası",
    ].map(opt),
  },
];

/** Flat list of every canonical feature (e.g. for a search/filter chip source). */
export const ALL_FEATURES: FeatureOption[] = FEATURE_GROUPS.flatMap((g) => g.options);
