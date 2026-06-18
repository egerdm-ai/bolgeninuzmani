import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Full-screen image lightbox: click a gallery image to enlarge; arrow keys /
 * on-screen buttons navigate; Escape or backdrop click closes.
 */
export function ImageLightbox({
  images,
  startIndex,
  onClose,
}: {
  images: string[];
  startIndex: number;
  onClose: () => void;
}) {
  const [i, setI] = useState(startIndex);
  const prev = () => setI((p) => (p - 1 + images.length) % images.length);
  const next = () => setI((p) => (p + 1) % images.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        aria-label="Kapat"
        className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-surface-2 text-foreground hover:bg-surface-3"
      >
        <X className="size-5" />
      </button>

      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          aria-label="Önceki"
          className="absolute left-4 flex size-11 items-center justify-center rounded-full bg-surface-2 text-foreground hover:bg-surface-3"
        >
          <ChevronLeft className="size-6" />
        </button>
      )}

      <img
        src={images[i]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
      />

      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          aria-label="Sonraki"
          className="absolute right-4 flex size-11 items-center justify-center rounded-full bg-surface-2 text-foreground hover:bg-surface-3"
        >
          <ChevronRight className="size-6" />
        </button>
      )}

      {images.length > 1 && (
        <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-surface-2 px-3 py-1 text-xs text-secondary-foreground">
          {i + 1} / {images.length}
        </span>
      )}
    </div>
  );
}
