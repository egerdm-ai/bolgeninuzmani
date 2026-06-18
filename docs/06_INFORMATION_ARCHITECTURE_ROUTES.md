# Information Architecture & Routes

## Public routes
| Route | Sayfa | Amaç |
|---|---|---|
| `/` | Landing | Ürün anlatımı + başvuru |
| `/p/[slug]` | Public portföy preview | Kapalı portföy teaser/link paylaşımı |
| `/v/[username]` | Public profesyonel profili | Profesyonel vitrin + sınırlı portföy kataloğu |
| `/apply` | Başvuru | Private beta application |
| `/login` | Giriş | Auth |

## Dashboard primary
| Route | Sayfa | Menü |
|---|---|---|
| `/dashboard` | Ana Sayfa | Ana |
| `/dashboard/search` | Portföyler / Portföy Ara | Keşfet |
| `/dashboard/regions` | Bölgeler | Keşfet |
| `/dashboard/professionals` | Profesyoneller | Keşfet |
| `/dashboard/searches` | Arayışlar | Keşfet |
| `/dashboard/saved` | Kaydedilenler | Keşfet |
| `/dashboard/portfolios` | Portföylerim | Workspace |
| `/dashboard/my-searches` | Arayışlarım | Workspace |
| `/dashboard/matches` | Eşleşmeler | Workspace |
| `/dashboard/detail-requests` | Detay Talepleri | Workspace |
| `/dashboard/assistant` | VAULT Asistan | Workspace |
| `/dashboard/notifications` | Bildirimler | Workspace |
| `/dashboard/profile` | Profilim | Hesap |
| `/dashboard/settings` | Ayarlar | Hesap |

## Internal detail routes
- `/dashboard/portfolio/[id]`
- `/dashboard/portfolios/new`
- `/dashboard/portfolios/[id]/edit`
- `/dashboard/share/[portfolioId]`
- `/dashboard/regions/[slug]`
- `/dashboard/professionals/[id]`
- `/dashboard/searches/[id]` — network arayış detayı.
- `/dashboard/my-searches/new`
- `/dashboard/my-searches/[id]` — benim arayış detayım.
