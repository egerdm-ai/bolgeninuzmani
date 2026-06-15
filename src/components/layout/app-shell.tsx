import { useState, type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function AppShell({
  children,
  searchPlaceholder,
}: {
  children: ReactNode;
  searchPlaceholder?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <div className="sticky top-0 hidden h-screen shrink-0 lg:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 border-border bg-sidebar p-0">
          <Sidebar collapsed={false} onToggle={() => {}} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobileNav={() => setMobileOpen(true)} searchPlaceholder={searchPlaceholder} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1400px] p-4 lg:p-7 ${className ?? ""}`}>{children}</div>;
}
