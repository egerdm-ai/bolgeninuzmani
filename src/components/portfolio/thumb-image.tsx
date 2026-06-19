/**
 * Renders the small THUMB and, if it fails to load (e.g. legacy pre-thumb images
 * that only have the full-size original), falls back to the full/display URL.
 * Keeps cards light (thumb ~50KB) without breaking old portfolios.
 */
export function ThumbImage({
  thumb,
  full,
  alt = "",
  className,
  onClick,
}: {
  thumb: string | null | undefined;
  full?: string | null;
  alt?: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <img
      src={thumb ?? full ?? undefined}
      alt={alt}
      loading="lazy"
      decoding="async"
      onClick={onClick}
      onError={(e) => {
        const el = e.currentTarget;
        if (full && el.src !== full) el.src = full;
      }}
      className={className}
    />
  );
}
