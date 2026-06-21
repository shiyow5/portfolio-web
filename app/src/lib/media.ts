/**
 * YouTube helpers for rendering work videos as thumbnails + an embedded player.
 * Uses the privacy-enhanced (nocookie) embed domain.
 */

const YT_ID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/;

/** Extracts the 11-char video id from a YouTube url, or null if not a YouTube url. */
export function youtubeId(url: string): string | null {
  const m = YT_ID.exec(url);
  return m ? m[1]! : null;
}

/** First YouTube video id among the given urls, or null. */
export function firstYoutubeId(urls: string[]): string | null {
  for (const url of urls) {
    const id = youtubeId(url);
    if (id) return id;
  }
  return null;
}

export function youtubeThumb(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function youtubeEmbed(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}
