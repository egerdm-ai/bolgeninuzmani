// ---------------------------------------------------------------------------
// VAULT Property Taxonomy — single source of truth
// Used by: /dashboard/search (filters), /dashboard/portfolios/new (dynamic
// step 3 fields), /dashboard/searches/new (buyer search filters) and AI matching.
//
// MOCK-ONLY. No backend. These definitions describe the shared real-estate
// taxonomy (categories, subcategories, transaction types, dynamic fields and
// filter sections) inspired by Turkish listing platforms.
// ---------------------------------------------------------------------------

export type FieldType = "text" | "number" | "select" | "boolean" | "multiselect" | "range";

export type Option = { value: string; label: string };

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: Option[];
  unit?: string;
  /** Counts as an important field for the data-completeness score. */
  important?: boolean;
}

export interface FieldGroup {
  id: string;
  label: string;
  /** lucide icon name is resolved in the UI layer; kept as string here. */
  fields: FieldDef[];
}

// ---------------------------------------------------------------------------
// Categories & subcategories
// ---------------------------------------------------------------------------

export type CategoryKey = "konut" | "arsa" | "ticari" | "turizm" | "endustriyel";

export interface CategoryDef {
  value: CategoryKey;
  label: string;
  subcategories: Option[];
  /** Field group ids used in portfolio wizard step 3 for this category. */
  detailGroups: string[];
}

export const categories: CategoryDef[] = [
  {
    value: "konut",
    label: "Konut",
    detailGroups: ["residential", "luxury"],
    subcategories: [
      { value: "villa", label: "Villa" },
      { value: "daire", label: "Daire" },
      { value: "mustakil", label: "Müstakil Ev" },
      { value: "rezidans", label: "Rezidans" },
      { value: "yali", label: "Yalı" },
      { value: "yazlik", label: "Yazlık" },
      { value: "kosk", label: "Köşk" },
    ],
  },
  {
    value: "arsa",
    label: "Arsa",
    detailGroups: ["land"],
    subcategories: [
      { value: "imarli", label: "İmarlı Arsa" },
      { value: "tarla", label: "Tarla" },
      { value: "bag_bahce", label: "Bağ / Bahçe" },
      { value: "konut_imarli", label: "Konut İmarlı" },
      { value: "ticari_imarli", label: "Ticari İmarlı" },
      { value: "turizm_imarli", label: "Turizm İmarlı" },
    ],
  },
  {
    value: "ticari",
    label: "Ticari",
    detailGroups: ["commercial"],
    subcategories: [
      { value: "ofis", label: "Ofis" },
      { value: "dukkan", label: "Dükkan" },
      { value: "magaza", label: "Mağaza" },
      { value: "plaza_kati", label: "Plaza Katı" },
      { value: "depo", label: "Depo" },
      { value: "is_yeri", label: "İş Yeri" },
    ],
  },
  {
    value: "turizm",
    label: "Turizm",
    detailGroups: ["tourism", "luxury"],
    subcategories: [
      { value: "otel", label: "Otel" },
      { value: "butik_otel", label: "Butik Otel" },
      { value: "tatil_koyu", label: "Tatil Köyü" },
      { value: "apart_otel", label: "Apart Otel" },
      { value: "pansiyon", label: "Pansiyon" },
    ],
  },
  {
    value: "endustriyel",
    label: "Endüstriyel",
    detailGroups: ["industrial"],
    subcategories: [
      { value: "fabrika", label: "Fabrika" },
      { value: "depo", label: "Depo" },
      { value: "uretim_tesisi", label: "Üretim Tesisi" },
      { value: "sanayi_arsasi", label: "Sanayi Arsası" },
    ],
  },
];

export const categoryByKey = Object.fromEntries(categories.map((c) => [c.value, c])) as Record<
  CategoryKey,
  CategoryDef
>;

// ---------------------------------------------------------------------------
// Transaction types
// ---------------------------------------------------------------------------

export const transactionTypes: Option[] = [
  { value: "satilik", label: "Satılık" },
  { value: "kiralik", label: "Kiralık" },
  { value: "devren", label: "Devren" },
  { value: "gunluk", label: "Günlük Kiralık" },
];

export const currencies: Option[] = [
  { value: "TRY", label: "₺ TRY" },
  { value: "USD", label: "$ USD" },
  { value: "EUR", label: "€ EUR" },
];

export const roomCounts: Option[] = [
  { value: "1+0", label: "1+0" },
  { value: "1+1", label: "1+1" },
  { value: "2+1", label: "2+1" },
  { value: "3+1", label: "3+1" },
  { value: "4+1", label: "4+1" },
  { value: "5+1", label: "5+1" },
  { value: "6+", label: "6+" },
];

export const dateAddedOptions: Option[] = [
  { value: "any", label: "Tümü" },
  { value: "24h", label: "Son 24 saat" },
  { value: "7d", label: "Son 7 gün" },
  { value: "30d", label: "Son 30 gün" },
];

// ---------------------------------------------------------------------------
// Shared option sets
// ---------------------------------------------------------------------------

const yesNo: Option[] = [
  { value: "any", label: "Farketmez" },
  { value: "yes", label: "Evet" },
  { value: "no", label: "Hayır" },
];

// ---------------------------------------------------------------------------
// Dynamic detail field groups (per category) — also feed search filters
// ---------------------------------------------------------------------------

export const residentialFields: FieldDef[] = [
  { key: "buildingAge", label: "Bina Yaşı", type: "select", important: true, options: [
    { value: "0", label: "0 (Sıfır)" },
    { value: "1-5", label: "1-5" },
    { value: "6-10", label: "6-10" },
    { value: "11-20", label: "11-20" },
    { value: "21+", label: "21+" },
  ] },
  { key: "floor", label: "Bulunduğu Kat", type: "text" },
  { key: "totalFloors", label: "Toplam Kat", type: "number" },
  { key: "heating", label: "Isıtma", type: "select", important: true, options: [
    { value: "floor", label: "Yerden Isıtma" },
    { value: "central", label: "Merkezi" },
    { value: "combi", label: "Kombi" },
    { value: "ac", label: "Klima" },
    { value: "none", label: "Yok" },
  ] },
  { key: "kitchenType", label: "Mutfak", type: "select", options: [
    { value: "open", label: "Açık (Amerikan)" },
    { value: "closed", label: "Kapalı" },
    { value: "island", label: "Ada Mutfak" },
  ] },
  { key: "balcony", label: "Balkon", type: "boolean" },
  { key: "elevator", label: "Asansör", type: "boolean" },
  { key: "parkingType", label: "Otopark", type: "select", options: [
    { value: "closed", label: "Kapalı Garaj" },
    { value: "open", label: "Açık Otopark" },
    { value: "both", label: "Açık + Kapalı" },
    { value: "none", label: "Yok" },
  ] },
  { key: "furnished", label: "Eşyalı", type: "boolean" },
  { key: "usageStatus", label: "Kullanım Durumu", type: "select", options: [
    { value: "empty", label: "Boş" },
    { value: "owner", label: "Mülk Sahibi" },
    { value: "tenant", label: "Kiracılı" },
  ] },
  { key: "inSite", label: "Site İçinde", type: "boolean" },
  { key: "creditEligible", label: "Krediye Uygun", type: "boolean" },
  { key: "deedStatus", label: "Tapu Durumu", type: "select", important: true, options: [
    { value: "kat_mulkiyeti", label: "Kat Mülkiyeti" },
    { value: "kat_irtifaki", label: "Kat İrtifakı" },
    { value: "mustakil", label: "Müstakil Tapu" },
    { value: "hisseli", label: "Hisseli Tapu" },
  ] },
];

export const landFields: FieldDef[] = [
  { key: "zoningStatus", label: "İmar Durumu", type: "select", important: true, options: [
    { value: "konut", label: "Konut İmarlı" },
    { value: "ticari", label: "Ticari İmarlı" },
    { value: "turizm", label: "Turizm İmarlı" },
    { value: "tarla", label: "Tarla" },
    { value: "sanayi", label: "Sanayi" },
    { value: "imarsiz", label: "İmarsız" },
  ] },
  { key: "landM2", label: "Alan", type: "number", unit: "m²", important: true },
  { key: "m2Price", label: "m² Birim Fiyat", type: "number", unit: "₺/m²" },
  { key: "adaNo", label: "Ada No", type: "text" },
  { key: "parselNo", label: "Parsel No", type: "text" },
  { key: "kaks", label: "KAKS / Emsal", type: "text", important: true },
  { key: "taks", label: "TAKS", type: "text" },
  { key: "gabari", label: "Gabari", type: "text" },
  { key: "roadFrontage", label: "Yola Cephe", type: "number", unit: "m" },
  { key: "hasRoad", label: "Yol Var", type: "boolean" },
  { key: "electricity", label: "Elektrik", type: "boolean" },
  { key: "water", label: "Su", type: "boolean" },
  { key: "sewerage", label: "Kanalizasyon", type: "boolean" },
  { key: "singleDeed", label: "Tek Tapu", type: "boolean" },
  { key: "suitableConstruction", label: "İnşaata Uygun", type: "boolean" },
  { key: "suitableRevenueShare", label: "Kat Karşılığı Uygun", type: "boolean" },
  { key: "villaZoning", label: "Villa İmarlı", type: "boolean" },
  { key: "tourismZoning", label: "Turizm İmarlı", type: "boolean" },
  { key: "commercialZoning", label: "Ticari İmarlı", type: "boolean" },
  { key: "nearSea", label: "Denize Yakın", type: "boolean" },
];

export const commercialFields: FieldDef[] = [
  { key: "commercialType", label: "Ticari Tip", type: "select", important: true, options: [
    { value: "ofis", label: "Ofis" },
    { value: "magaza", label: "Mağaza" },
    { value: "depo", label: "Depo" },
    { value: "plaza", label: "Plaza Katı" },
    { value: "fabrika", label: "Fabrika" },
  ] },
  { key: "indoorM2", label: "Kapalı Alan", type: "number", unit: "m²", important: true },
  { key: "outdoorM2", label: "Açık Alan", type: "number", unit: "m²" },
  { key: "ceilingHeight", label: "Tavan Yüksekliği", type: "number", unit: "m" },
  { key: "frontageWidth", label: "Cephe Genişliği", type: "number", unit: "m" },
  { key: "entranceCount", label: "Giriş Sayısı", type: "number" },
  { key: "loadingArea", label: "Yükleme Alanı", type: "boolean" },
  { key: "storage", label: "Depo Alanı", type: "boolean" },
  { key: "generator", label: "Jeneratör", type: "boolean" },
  { key: "fireSystem", label: "Yangın Sistemi", type: "boolean" },
  { key: "licenseStatus", label: "Ruhsat Durumu", type: "select", important: true, options: [
    { value: "isyeri", label: "İş Yeri Ruhsatı Var" },
    { value: "yapi", label: "Yapı Ruhsatı" },
    { value: "yok", label: "Ruhsat Yok" },
  ] },
  { key: "tenantStatus", label: "Kiracı Durumu", type: "select", options: [
    { value: "empty", label: "Boş" },
    { value: "tenant", label: "Kiracılı" },
  ] },
  { key: "transferFee", label: "Devren Bedeli", type: "number", unit: "₺" },
  { key: "monthlyRent", label: "Kira Getirisi", type: "number", unit: "₺" },
  { key: "turnover", label: "Ciro Bilgisi", type: "number", unit: "₺/ay" },
  { key: "truckAccess", label: "Tır Girişi", type: "boolean" },
  { key: "inOsb", label: "OSB İçinde", type: "boolean" },
];

export const tourismFields: FieldDef[] = [
  { key: "roomCount", label: "Oda Sayısı", type: "number", important: true },
  { key: "starRating", label: "Yıldız", type: "select", options: [
    { value: "3", label: "3 Yıldız" },
    { value: "4", label: "4 Yıldız" },
    { value: "5", label: "5 Yıldız" },
    { value: "butik", label: "Butik" },
  ] },
  { key: "bedCapacity", label: "Yatak Kapasitesi", type: "number", important: true },
  { key: "restaurant", label: "Restoran", type: "boolean" },
  { key: "spaWellness", label: "SPA / Wellness", type: "boolean" },
  { key: "pool", label: "Havuz", type: "boolean" },
  { key: "beach", label: "Plaj / Sahil", type: "boolean" },
  { key: "tourismLicense", label: "Turizm Belgesi", type: "select", important: true, options: [
    { value: "isletme", label: "İşletme Belgeli" },
    { value: "yatirim", label: "Yatırım Belgeli" },
    { value: "belediye", label: "Belediye Belgeli" },
  ] },
  { key: "occupancy", label: "Doluluk Oranı", type: "number", unit: "%" },
  { key: "season", label: "Sezon", type: "select", options: [
    { value: "12", label: "12 Ay" },
    { value: "summer", label: "Yazlık" },
    { value: "winter", label: "Kışlık" },
  ] },
];

export const industrialFields: FieldDef[] = [
  { key: "indoorM2", label: "Kapalı Alan", type: "number", unit: "m²", important: true },
  { key: "openAreaM2", label: "Açık Alan", type: "number", unit: "m²" },
  { key: "ceilingHeight", label: "Tavan Yüksekliği", type: "number", unit: "m" },
  { key: "crane", label: "Vinç", type: "boolean" },
  { key: "powerCapacity", label: "Trafo / Güç", type: "text", important: true },
  { key: "generator", label: "Jeneratör", type: "boolean" },
  { key: "loadingDocks", label: "Yükleme Rampası", type: "number" },
  { key: "industrialZoning", label: "OSB / Sanayi İmarı", type: "boolean", important: true },
];

// Luxury features (multiselect — applies to konut & turizm)
export const luxuryFeatures: Option[] = [
  { value: "deniz_manzara", label: "Deniz Manzarası" },
  { value: "bogaz_manzara", label: "Boğaz Manzarası" },
  { value: "orman_manzara", label: "Orman Manzarası" },
  { value: "havuz", label: "Havuz" },
  { value: "kapali_havuz", label: "Kapalı Havuz" },
  { value: "sonsuzluk_havuz", label: "Sonsuzluk Havuzu" },
  { value: "spa", label: "Spa" },
  { value: "sauna", label: "Sauna" },
  { value: "hamam", label: "Hamam" },
  { value: "sinema_odasi", label: "Sinema Odası" },
  { value: "sarap_mahzeni", label: "Şarap Mahzeni" },
  { value: "personel_odasi", label: "Personel Odası" },
  { value: "misafir_evi", label: "Misafir Evi" },
  { value: "ozel_iskele", label: "Özel İskele" },
  { value: "denize_sifir", label: "Denize Sıfır" },
  { value: "helipad", label: "Helipad" },
];

// ---------------------------------------------------------------------------
// Detail group registry (resolved by category for the wizard)
// ---------------------------------------------------------------------------

export const detailGroupRegistry: Record<string, FieldGroup> = {
  residential: { id: "residential", label: "Konut Detayları", fields: residentialFields },
  land: { id: "land", label: "Arsa Detayları", fields: landFields },
  commercial: { id: "commercial", label: "Ticari Detaylar", fields: commercialFields },
  tourism: { id: "tourism", label: "Otel / Turizm Detayları", fields: tourismFields },
  industrial: { id: "industrial", label: "Endüstriyel Detaylar", fields: industrialFields },
  luxury: {
    id: "luxury",
    label: "Luxury Özellikler",
    fields: [{ key: "luxuryFeatures", label: "Luxury Özellikler", type: "multiselect", options: luxuryFeatures }],
  },
};

export function getDetailGroupsForCategory(category: CategoryKey): FieldGroup[] {
  return (categoryByKey[category]?.detailGroups ?? []).map((id) => detailGroupRegistry[id]).filter(Boolean);
}

// ---------------------------------------------------------------------------
// Quick filter chips — Airbnb-style horizontal row under the search bar.
// `kind: "modal"` chips open the filter modal; `kind: "toggle"` chips flip a
// boolean filter key and live-update the result count.
// ---------------------------------------------------------------------------

export interface QuickChip {
  id: string;
  label: string;
  kind: "modal" | "toggle";
  /** filter state key for toggle chips */
  key?: string;
  /** which modal section to scroll/open to for modal chips */
  section?: string;
}

export const searchQuickChips: QuickChip[] = [
  { id: "fiyat", label: "Fiyat", kind: "modal", section: "price" },
  { id: "tip", label: "Portföy Tipi", kind: "modal", section: "type" },
  { id: "deniz_manzara", label: "Deniz Manzaralı", kind: "toggle", key: "qcDeniz" },
  { id: "havuz", label: "Havuzlu", kind: "toggle", key: "qcHavuz" },
  { id: "5oda", label: "5+ Oda", kind: "toggle", key: "qc5Oda" },
  { id: "otopark", label: "Otoparklı", kind: "toggle", key: "qcOtopark" },
  { id: "pdf", label: "PDF Hazır", kind: "toggle", key: "qcPdf" },
  { id: "uzman", label: "Bölge Uzmanından", kind: "toggle", key: "qcUzman" },
  { id: "talep", label: "Detay Talebi Açık", kind: "toggle", key: "qcTalep" },
  { id: "yeni", label: "Yeni Eklenen", kind: "toggle", key: "qcYeni" },
];

// Legacy flat chip list (kept for backward compatibility)
export const quickFilterChips: string[] = searchQuickChips
  .filter((c) => c.kind === "toggle")
  .map((c) => c.label);

// ---------------------------------------------------------------------------
// "Önerilenler" — large selectable recommended filter cards (Airbnb style)
// ---------------------------------------------------------------------------

export interface RecommendedFilter {
  key: string;
  label: string;
  /** lucide icon name resolved in the UI layer */
  icon: string;
  hint?: string;
}

export const recommendedFilters: RecommendedFilter[] = [
  { key: "recDeniz", label: "Deniz Manzaralı", icon: "Waves", hint: "Manzara garantili" },
  { key: "recHavuz", label: "Havuzlu", icon: "Droplets", hint: "Özel / ortak" },
  { key: "recPdf", label: "PDF Hazır", icon: "FileText", hint: "Sunum dosyası var" },
  { key: "recUzman", label: "Bölge Uzmanından", icon: "BadgeCheck", hint: "Doğrulanmış uzman" },
  { key: "recEslesen", label: "Arayışlarımla Eşleşen", icon: "Sparkles", hint: "AI önerisi" },
  { key: "recYeni", label: "Yeni Eklenen", icon: "Clock", hint: "Son 7 gün" },
  { key: "recTalep", label: "Detay Talebi Açık", icon: "Send", hint: "Hızlı erişim" },
  { key: "recOtopark", label: "Otoparklı", icon: "Car", hint: "Kapalı / açık" },
];

// ---------------------------------------------------------------------------
// Portföy Tipi (modal segmented buttons) — display list mapped to CategoryKey
// ---------------------------------------------------------------------------

export interface ModalCategory {
  value: string;
  label: string;
  /** mapped taxonomy category for conditional sections */
  category?: CategoryKey;
}

export const modalCategories: ModalCategory[] = [
  { value: "all", label: "Tümü" },
  { value: "konut", label: "Konut", category: "konut" },
  { value: "villa", label: "Villa / Yalı", category: "konut" },
  { value: "arsa", label: "Arsa", category: "arsa" },
  { value: "ticari", label: "Ticari", category: "ticari" },
  { value: "turizm", label: "Otel / Turizm", category: "turizm" },
  { value: "endustriyel", label: "Endüstriyel", category: "endustriyel" },
  { value: "ozel_varlik", label: "Özel Varlık", category: "konut" },
];

export const modalTransactionTypes: Option[] = [
  { value: "satilik", label: "Satılık" },
  { value: "kiralik", label: "Kiralık" },
  { value: "sezonluk", label: "Sezonluk" },
  { value: "devren_satilik", label: "Devren Satılık" },
  { value: "devren_kiralik", label: "Devren Kiralık" },
];

// ---------------------------------------------------------------------------
// Oda ve Yaşam Alanları — plus/minus counters
// ---------------------------------------------------------------------------

export interface CounterDef {
  key: string;
  label: string;
  max?: number;
}

export const livingSpaceCounters: CounterDef[] = [
  { key: "cntRoom", label: "Oda", max: 10 },
  { key: "cntSalon", label: "Salon", max: 5 },
  { key: "cntBedroom", label: "Yatak odası", max: 10 },
  { key: "cntBath", label: "Banyo", max: 8 },
  { key: "cntWc", label: "WC", max: 8 },
  { key: "cntParking", label: "Otopark kapasitesi", max: 10 },
];

// ---------------------------------------------------------------------------
// Alan / m² range fields
// ---------------------------------------------------------------------------

export const areaRangeFields: { key: string; label: string }[] = [
  { key: "grossM2", label: "Brüt m²" },
  { key: "netM2", label: "Net m²" },
  { key: "landM2", label: "Arsa m²" },
  { key: "indoorM2", label: "Kapalı alan m²" },
  { key: "outdoorM2", label: "Açık alan m²" },
];

// ---------------------------------------------------------------------------
// Konut / Villa detayları (modal checkboxes/selects)
// ---------------------------------------------------------------------------

export const konutDetailFields: FieldDef[] = [
  { key: "buildingAge", label: "Bina yaşı", type: "select", options: [
    { value: "0", label: "0 (Sıfır)" },
    { value: "1-5", label: "1-5" },
    { value: "6-10", label: "6-10" },
    { value: "11-20", label: "11-20" },
    { value: "21+", label: "21+" },
  ] },
  { key: "floor", label: "Kat", type: "text" },
  { key: "totalFloors", label: "Kat sayısı", type: "number" },
  { key: "heating", label: "Isıtma tipi", type: "select", options: [
    { value: "floor", label: "Yerden Isıtma" },
    { value: "central", label: "Merkezi" },
    { value: "combi", label: "Kombi" },
    { value: "ac", label: "Klima" },
  ] },
  { key: "furnished", label: "Eşyalı", type: "boolean" },
  { key: "inSite", label: "Site içinde", type: "boolean" },
  { key: "balcony", label: "Balkon", type: "boolean" },
  { key: "terrace", label: "Teras", type: "boolean" },
  { key: "garden", label: "Bahçe", type: "boolean" },
  { key: "elevator", label: "Asansör", type: "boolean" },
  { key: "security", label: "Güvenlik", type: "boolean" },
  { key: "smartHome", label: "Akıllı ev", type: "boolean" },
  { key: "generator", label: "Jeneratör", type: "boolean" },
];

// ---------------------------------------------------------------------------
// Privacy / access + professional + match filter field defs (search only)
// ---------------------------------------------------------------------------

export const privacyAccessFields: FieldDef[] = [
  { key: "requestRequired", label: "Detay Talebi Gerekli", type: "boolean" },
  { key: "pdfLocked", label: "PDF Kilitli", type: "boolean" },
  { key: "addressHidden", label: "Tam Adres Gizli", type: "boolean" },
  { key: "phoneHidden", label: "Telefon Gizli", type: "boolean" },
  { key: "approvedAccessOnly", label: "Onaylı Erişimim Olanlar", type: "boolean" },
  { key: "previouslyRequested", label: "Daha Önce Talep Ettiklerim", type: "boolean" },
];

export const professionalFields: FieldDef[] = [
  { key: "verifiedOnly", label: "Sadece doğrulanmış profesyoneller", type: "boolean" },
  { key: "regionExpertsOnly", label: "Bölge uzmanlarından portföyler", type: "boolean" },
  { key: "followedOnly", label: "Takip ettiğim profesyoneller", type: "boolean" },
  { key: "highActivity", label: "Aktif portföy sayısı yüksek olanlar", type: "boolean" },
  { key: "highResponse", label: "Yanıt oranı yüksek olanlar", type: "boolean" },
];

export const matchSearchFields: FieldDef[] = [
  { key: "matchMySearches", label: "Arayışlarımla eşleşenler", type: "boolean" },
  { key: "newMatches", label: "Yeni eşleşme gelenler", type: "boolean" },
  { key: "savedSearchFit", label: "Kaydedilen aramalarıma uygun", type: "boolean" },
  { key: "aiRecommended", label: "AI önerili portföyler", type: "boolean" },
  { key: "highDataScore", label: "Veri skoru yüksek portföyler", type: "boolean" },
];

// ---------------------------------------------------------------------------
// Mock price histogram distribution (for the Airbnb-style range slider)
// ---------------------------------------------------------------------------

export const priceHistogram: number[] = [
  3, 6, 10, 16, 24, 33, 41, 48, 52, 49, 44, 38, 31, 27, 22, 18, 15, 12, 9, 7, 5, 4, 3, 2,
];

// Price bounds per currency (mock)
export const priceBounds: Record<string, { min: number; max: number; step: number }> = {
  TRY: { min: 0, max: 500_000_000, step: 1_000_000 },
  USD: { min: 0, max: 20_000_000, step: 50_000 },
  EUR: { min: 0, max: 18_000_000, step: 50_000 },
};

// ---------------------------------------------------------------------------
// Filter section registry for /dashboard/search
// ---------------------------------------------------------------------------

export interface FilterSectionDef {
  id: string;
  label: string;
  /** When set, the section is only relevant for these categories. */
  categories?: CategoryKey[];
}

export const filterSections: FilterSectionDef[] = [
  { id: "quick", label: "Hızlı Filtreler" },
  { id: "location", label: "Lokasyon" },
  { id: "type", label: "Portföy Tipi" },
  { id: "price", label: "Fiyat" },
  { id: "area", label: "Alan / m²" },
  { id: "residential", label: "Konut Detayları", categories: ["konut"] },
  { id: "land", label: "Arsa Detayları", categories: ["arsa"] },
  { id: "commercial", label: "Ticari Detaylar", categories: ["ticari", "endustriyel"] },
  { id: "luxury", label: "Luxury Özellikler", categories: ["konut", "turizm"] },
  { id: "privacy", label: "Gizlilik & Erişim" },
  { id: "professional", label: "Profesyonel / Bölge Uzmanı" },
];

// ---------------------------------------------------------------------------
// Filters state model
// ---------------------------------------------------------------------------

export type FilterValue = string | number | boolean | string[] | undefined;
export type FilterState = Record<string, FilterValue>;

export const defaultFilterState: FilterState = {
  category: "konut",
  transaction: "satilik",
  currency: "TRY",
  dateAdded: "any",
};

/** Count how many filters are actively set (ignoring defaults). */
export function countActiveFilters(state: FilterState): number {
  return Object.entries(state).filter(([key, v]) => {
    if (v === undefined || v === "" || v === false || v === "any") return false;
    if (Array.isArray(v)) return v.length > 0;
    if (defaultFilterState[key] !== undefined && defaultFilterState[key] === v) return false;
    return true;
  }).length;
}

// ---------------------------------------------------------------------------
// Data-completeness scoring for the portfolio wizard
// ---------------------------------------------------------------------------

export interface CompletenessResult {
  score: number;
  level: "low" | "medium" | "high";
  requiredDone: number;
  requiredTotal: number;
  optionalDone: number;
  optionalTotal: number;
  missingImportant: string[];
}

/**
 * Compute a completeness score from a flat values record. Required core fields
 * are weighted higher; category "important" fields are tracked as missing.
 */
export function computeCompleteness(
  values: Record<string, FilterValue>,
  category: CategoryKey,
): CompletenessResult {
  const coreRequired: { key: string; label: string }[] = [
    { key: "title", label: "Başlık" },
    { key: "category", label: "Kategori" },
    { key: "subcategory", label: "Alt Kategori" },
    { key: "transaction", label: "İşlem Tipi" },
    { key: "city", label: "Şehir" },
    { key: "district", label: "İlçe" },
    { key: "price", label: "Fiyat" },
  ];

  const detailFields = getDetailGroupsForCategory(category).flatMap((g) => g.fields);
  const importantFields = detailFields.filter((f) => f.important);
  const optionalFields = detailFields.filter((f) => !f.important);

  const isFilled = (v: FilterValue) =>
    v !== undefined && v !== "" && v !== null && (!Array.isArray(v) || v.length > 0);

  const requiredItems = [...coreRequired, ...importantFields.map((f) => ({ key: f.key, label: f.label }))];
  const requiredDone = requiredItems.filter((f) => isFilled(values[f.key])).length;
  const requiredTotal = requiredItems.length;

  const optionalDone = optionalFields.filter((f) => isFilled(values[f.key])).length;
  const optionalTotal = optionalFields.length || 1;

  const missingImportant = requiredItems.filter((f) => !isFilled(values[f.key])).map((f) => f.label);

  // weight: required 75%, optional 25%
  const reqRatio = requiredTotal ? requiredDone / requiredTotal : 1;
  const optRatio = optionalTotal ? optionalDone / optionalTotal : 1;
  const score = Math.round((reqRatio * 0.75 + optRatio * 0.25) * 100);
  const level: "low" | "medium" | "high" = score >= 80 ? "high" : score >= 55 ? "medium" : "low";

  return { score, level, requiredDone, requiredTotal, optionalDone, optionalTotal, missingImportant };
}

// ---------------------------------------------------------------------------
// Mock "AI prompt → filters" parser (no backend, naive keyword matching)
// ---------------------------------------------------------------------------

export interface ParsedPrompt {
  filters: FilterState;
  summary: string[];
}

const cityKeywords: Record<string, { city: string; region: string }> = {
  bodrum: { city: "Muğla", region: "Bodrum" },
  yalıkavak: { city: "Muğla", region: "Yalıkavak" },
  yalikavak: { city: "Muğla", region: "Yalıkavak" },
  türkbükü: { city: "Muğla", region: "Türkbükü" },
  turkbuku: { city: "Muğla", region: "Türkbükü" },
  bebek: { city: "İstanbul", region: "Bebek" },
  riva: { city: "İstanbul", region: "Riva" },
  çeşme: { city: "İzmir", region: "Çeşme" },
  cesme: { city: "İzmir", region: "Çeşme" },
};

/**
 * Very small mock NLP: scans a Turkish prompt for region, type, budget, rooms
 * and luxury features. Returns a filter object + human-readable summary.
 */
export function parsePromptToFilters(prompt: string): ParsedPrompt {
  const lower = prompt.toLocaleLowerCase("tr-TR");
  const filters: FilterState = { ...defaultFilterState };
  const summary: string[] = [];

  for (const [kw, loc] of Object.entries(cityKeywords)) {
    if (lower.includes(kw)) {
      filters.city = loc.city;
      filters.region = loc.region;
      summary.push(`Bölge: ${loc.region}`);
      break;
    }
  }

  const typeMap: { kw: string[]; sub: string; cat: CategoryKey; label: string }[] = [
    { kw: ["villa"], sub: "villa", cat: "konut", label: "Villa" },
    { kw: ["daire", "rezidans"], sub: "daire", cat: "konut", label: "Daire" },
    { kw: ["yalı", "yali"], sub: "yali", cat: "konut", label: "Yalı" },
    { kw: ["arsa", "tarla"], sub: "imarli", cat: "arsa", label: "Arsa" },
    { kw: ["otel", "butik otel"], sub: "otel", cat: "turizm", label: "Otel" },
    { kw: ["ofis", "dükkan", "mağaza", "ticari"], sub: "ofis", cat: "ticari", label: "Ticari" },
  ];
  for (const t of typeMap) {
    if (t.kw.some((k) => lower.includes(k))) {
      filters.category = t.cat;
      filters.subcategory = t.sub;
      summary.push(`Tip: ${t.label}`);
      break;
    }
  }

  // budget like "100m", "50 milyon", "100M TL"
  const budgetMatch = lower.match(/(\d+)\s*(m|milyon|milyon tl|m tl)/);
  if (budgetMatch) {
    const max = Number(budgetMatch[1]) * 1_000_000;
    filters.priceMax = max;
    summary.push(`Bütçe ≤ ${budgetMatch[1]}M`);
  }

  // rooms like 5+1
  const roomMatch = lower.match(/(\d\+\d|\d\+)/);
  if (roomMatch) {
    filters.rooms = roomMatch[1].includes("+") && !/\d$/.test(roomMatch[1]) ? `${roomMatch[1]}` : roomMatch[1];
    summary.push(`Oda: ${filters.rooms}`);
  }

  const luxHits = luxuryFeatures.filter((f) => lower.includes(f.label.toLocaleLowerCase("tr-TR")));
  if (luxHits.length) {
    filters.luxuryFeatures = luxHits.map((f) => f.value);
    summary.push(`Özellikler: ${luxHits.map((f) => f.label).join(", ")}`);
  }

  if (summary.length === 0) summary.push("Belirgin kriter bulunamadı — filtreleri elle ayarlayın.");

  return { filters, summary };
}
