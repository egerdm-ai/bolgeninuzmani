# Match Routing Rules

How matches link to their detail pages.

| Match source | Links to |
| --- | --- |
| My saved search → portfolio | `/dashboard/my-searches/$id` (the search), portfolio → `/dashboard/portfolios/$id` |
| My portfolio → network search | `/dashboard/searches/$id` (network search) |
| Portfolio card | `/dashboard/portfolios/$id` |
| Professional suggestion | `/dashboard/professionals/$id` |

## /dashboard/matches tabs
1. **Arayışlarıma Uyan Portföyler** — best portfolio per `mySearches` → my-searches detail.
2. **Portföylerime Uyan Arayışlar** — `networkSearches` matching `myPortfolios` → searches detail.
3. **Network Arayışları** — `NetworkSearchCard` grid → searches detail.
4. **Bölge Uzmanı Önerileri** — professionals → professionals detail.
5. **Yeni Eşleşmeler** — recent highlights → searches detail.

## Deep link
`/dashboard/matches?searchId=<id>&source=network` renders a focused panel showing the user's
portfolios that match that network search (`getMyMatchesForBuyerSearch`).

## Helpers (`src/lib/mock/matching.ts`)
- `getMatchesForSearch(q)` — all portfolios.
- `getMyMatchesForSearch(q)` / `getMyMatchesForBuyerSearch(bs)` — restricted to `myPortfolios`.
- `getMatchingSearchesForPortfolio(p)` — network searches a portfolio matches.

## Backend TODO
Replace mock scorer with a real matching service; precompute match rows.
