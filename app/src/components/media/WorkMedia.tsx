import type { Work } from '../../lib/works';
import { firstYoutubeId } from '../../lib/media';
import { WorkVideo } from './WorkVideo';
import { WorkImage } from './WorkImage';

/**
 * Renders a work's visual: a YouTube video thumbnail if it has one, otherwise a
 * screenshot image, otherwise nothing.
 */
export function WorkMedia({ work, className }: { work: Work; className?: string }) {
  const ytId = firstYoutubeId((work.links.sources ?? []).map((s) => s.url));
  if (ytId) return <WorkVideo id={ytId} title={work.title} className={className} />;
  if (work.image) return <WorkImage src={work.image} title={work.title} className={className} />;
  return null;
}
