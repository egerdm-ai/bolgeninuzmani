import type { Currency, PortfolioStatus, PortfolioType, PortfolioCategory, DetailRequestStatus } from "@/lib/mock/types";

const currencySymbols: Record<Currency, string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
};

export function formatPrice(price: number, currency: Currency = "TRY") {
  const formatted = new Intl.NumberFormat("tr-TR").format(price);
  if (currency === "TRY") return `${formatted} TL`;
  return `${currencySymbols[currency]}${formatted}`;
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("tr-TR").format(n);
}

export const portfolioTypeLabels: Record<PortfolioType, string> = {
  villa: "Villa",
  apartment: "Daire",
  land: "Arsa",
  commercial: "Ticari",
  hotel: "Otel",
  factory: "Fabrika",
  office: "Ofis",
  restaurant: "Restoran",
};

export const categoryLabels: Record<PortfolioCategory, string> = {
  konut: "Konut",
  ticari: "Ticari",
  arsa: "Arsa",
  turizm: "Turizm",
  isletme: "İşletme",
  ozel_varlik: "Özel Varlık",
};

export const statusLabels: Record<PortfolioStatus, string> = {
  draft: "Taslak",
  active: "Aktif",
  passive: "Pasif",
  sold_or_rented: "Satıldı / Kiralandı",
};

export const statusTones: Record<PortfolioStatus, "success" | "warning" | "muted" | "info"> = {
  draft: "warning",
  active: "success",
  passive: "muted",
  sold_or_rented: "info",
};

export const requestStatusLabels: Record<DetailRequestStatus, string> = {
  new: "Yeni",
  read: "Okundu",
  answered: "Yanıtlandı",
  approved: "Onaylandı",
  rejected: "Reddedildi",
};

export const requestStatusTones: Record<DetailRequestStatus, "success" | "warning" | "muted" | "info" | "danger"> = {
  new: "warning",
  read: "info",
  answered: "info",
  approved: "success",
  rejected: "danger",
};

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
