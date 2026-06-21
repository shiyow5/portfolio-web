import { useEffect, useState } from 'react';
import { Play, X } from 'lucide-react';
import { firstYoutubeId, youtubeEmbed, youtubeThumb } from '../../lib/media';

/** Renders a video thumbnail for the first YouTube url among `urls`, or nothing. */
export function WorkVideoFromSources({
  urls,
  title,
  className,
}: {
  urls: string[];
  title: string;
  className?: string;
}) {
  const id = firstYoutubeId(urls);
  return id ? <WorkVideo id={id} title={title} className={className} /> : null;
}

/**
 * A YouTube thumbnail that opens an embedded (privacy-enhanced) player in a
 * lightbox on click. Self-contained — manages its own open state.
 */
export function WorkVideo({
  id,
  title,
  className = '',
}: {
  id: string;
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
        aria-label={`${title} の動画を再生`}
        className={`group/media relative block overflow-hidden ${className}`}
      >
        <img
          src={youtubeThumb(id)}
          alt={`${title} の動画サムネイル`}
          loading="lazy"
          className="block h-full w-full object-cover transition-transform duration-300 group-hover/media:scale-[1.03]"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover/media:bg-black/35">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-black shadow-lg">
            <Play size={18} className="ml-0.5 fill-current" />
          </span>
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} の動画`}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4"
        >
          <div
            className="relative aspect-video w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`${youtubeEmbed(id)}?autoplay=1&rel=0`}
              title={title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="動画を閉じる"
              className="absolute -top-10 right-0 text-white/80 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
