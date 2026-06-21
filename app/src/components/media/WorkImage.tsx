import { useEffect, useState } from 'react';
import { Maximize2, X } from 'lucide-react';

/** A work screenshot thumbnail that opens the full image in a lightbox on click. */
export function WorkImage({
  src,
  title,
  className = '',
}: {
  src: string;
  title: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${title} の画像を拡大`}
        className={`group/media relative block overflow-hidden ${className}`}
      >
        <img
          src={src}
          alt={`${title} のスクリーンショット`}
          loading="lazy"
          className="block h-full w-full object-cover transition-transform duration-300 group-hover/media:scale-[1.03]"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition-opacity group-hover/media:opacity-100">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-black shadow-lg">
            <Maximize2 size={16} />
          </span>
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} の画像`}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4"
        >
          <img
            src={src}
            alt={`${title} のスクリーンショット`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[92vw] object-contain shadow-2xl"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="画像を閉じる"
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X size={26} />
          </button>
        </div>
      )}
    </>
  );
}
