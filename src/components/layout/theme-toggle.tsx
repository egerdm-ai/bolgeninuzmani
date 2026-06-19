import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Dark (default) ↔ Light theme toggle (D35). Sets `light`/`dark` on <html> and
 * persists to localStorage('bu-theme'); the pre-paint init script in __root.tsx
 * applies the saved theme before hydration to avoid a flash.
 */
export function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    const el = document.documentElement;
    el.classList.toggle("light", next);
    el.classList.toggle("dark", !next);
    try {
      localStorage.setItem("bu-theme", next ? "light" : "dark");
    } catch {
      /* storage unavailable — ignore */
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-label="Temayı değiştir"
      title={light ? "Koyu temaya geç" : "Açık temaya geç"}
      className="text-bu-text"
    >
      {light ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </Button>
  );
}
