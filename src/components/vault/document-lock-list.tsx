import { Lock, FileText, FileBadge, FileCheck, File } from "lucide-react";
import type { PortfolioDocument } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const typeIcons = {
  pdf: FileText,
  deed: FileBadge,
  permit: FileCheck,
  other: File,
};

export function DocumentLockList({
  documents,
  unlocked,
}: {
  documents: PortfolioDocument[];
  unlocked?: boolean;
}) {
  if (documents.length === 0) {
    return <p className="text-sm text-muted-foreground">Bu portföy için belge eklenmemiş.</p>;
  }
  return (
    <ul className="space-y-2">
      {documents.map((doc) => {
        const Icon = typeIcons[doc.type];
        const locked = doc.isLocked && !unlocked;
        return (
          <li
            key={doc.id}
            className={cn(
              "flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm",
              locked ? "border-border bg-surface-2/60" : "border-success/25 bg-success/5",
            )}
          >
            <span className="flex items-center gap-2.5 text-secondary-foreground">
              <Icon className="size-4 text-gold" />
              {doc.name}
            </span>
            {locked ? (
              <Lock className="size-3.5 text-muted-foreground" />
            ) : (
              <span className="text-xs font-medium text-success">İndir</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
