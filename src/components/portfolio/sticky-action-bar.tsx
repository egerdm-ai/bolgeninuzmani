import type { ReactNode } from "react";

/**
 * Sticky bottom action bar so primary form actions (Kaydet / İptal / Yayınla)
 * stay visible while scrolling a long create/edit form.
 */
export function StickyActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-3 z-20 flex items-center justify-end gap-2 rounded-xl border border-border bg-background/95 px-4 py-3 shadow-elegant backdrop-blur">
      {children}
    </div>
  );
}
