// Feature flags — Slice 0 route quarantine (D18).
//
// Deferred features are gated OFF: their routes still EXIST (never deleted) but
// redirect to /dashboard via `beforeLoad`, and their nav entries + reachable CTAs
// are hidden. Flip a flag to `true` to re-enable a feature when its phase is built.
//
// See docs/route-quarantine.md for the full mapping.
export const featureFlags = {
  /** Arayış: /dashboard/searches (network) + /dashboard/my-searches (own). */
  arayis: true,
  /** Eşleşmeler: /dashboard/matches. */
  matches: true,
  /** Takip/Kaydedilenler: /dashboard/favorites + follow affordances. */
  follow: true,
  /** AI Asistan: /dashboard/assistant (retired /dashboard/concierge merges here). */
  assistant: false,
  /** AI içe aktarma: /dashboard/ai-import. */
  aiImport: false,
  /** Bölge uzmanı dizini: /dashboard/regions. */
  regions: false,
  /**
   * Profesyonel DİZİNİ (index) — /dashboard/professionals (bölge uzmanı dizini).
   * Individual profiles (/dashboard/professionals/$id) stay reachable as
   * portfolio-owner views (also public at /v/$username).
   */
  professionals: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export function isEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}
