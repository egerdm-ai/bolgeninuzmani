# Navigation & Button-Link Rules

## Genel kural
Hiçbir CTA ölü olmamalı. Backend olmayan her aksiyon local mock/toast/drawer/modal ile çalışmalı.

## Sidebar
- Ana Sayfa → `/dashboard`
- Keşfet > Portföyler → `/dashboard/search`
- Keşfet > Bölgeler → `/dashboard/regions`
- Keşfet > Profesyoneller → `/dashboard/professionals`
- Keşfet > Arayışlar → `/dashboard/searches`
- Keşfet > Kaydedilenler → `/dashboard/saved`
- Portföylerim → `/dashboard/portfolios`
- Arayışlarım → `/dashboard/my-searches`
- Eşleşmeler → `/dashboard/matches`
- Detay Talepleri → `/dashboard/detail-requests`
- VAULT Asistan → `/dashboard/assistant`
- Bildirimler → `/dashboard/notifications`

## Portföy kartı aksiyonları
- Portföyü Gör → `/dashboard/portfolio/[id]`
- Detay Talep Et → detail request modal
- Kaydet → favorite toggle
- Paylaş → `/dashboard/share/[portfolioId]`
- Owner avatar/name → `/dashboard/professionals/[id]`
- Region chip → `/dashboard/regions/[slug]`

## Arayış aksiyonları
- Network Arayışı Gör → `/dashboard/searches/[id]`
- Benim Arayışım Gör → `/dashboard/my-searches/[id]`
- Eşleşmeleri Gör → `.../[id]?tab=matches`
- Düzenle → `.../[id]?mode=edit`
- Arayışlarım’a Kaydet → save modal + `/dashboard/my-searches/[id]`

## Match aksiyonları
- Neden Uyumlu? → explanation drawer
- Detay Talebi Gönder → request modal
- Portföyü Paylaş → Share Studio
- Eşleşmeyi Gizle → local status hidden

## Bildirim aksiyonları
- Arayışıma yeni match → `/dashboard/my-searches/[id]?tab=matches`
- Portföyüm network arayışla eşleşti → `/dashboard/matches?portfolioId=[id]`
- Bölgeye yeni portföy → `/dashboard/search?region=[slug]`
- Detay talebi → `/dashboard/detail-requests?request=[id]`
