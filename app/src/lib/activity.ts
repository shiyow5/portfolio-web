import raw from '../data/activity.json';

export type ActivityCategory = 'project' | 'release' | 'talk' | 'award' | 'job' | 'post';

export interface ActivityLink {
  label: string;
  url: string;
}

export interface Activity {
  id: string;
  date: string;
  title: string;
  category: ActivityCategory;
  summary: string;
  tags: string[];
  links: ActivityLink[];
}

const ACTIVITIES: Activity[] = (raw as Activity[])
  .slice()
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export { ACTIVITIES };

export interface ActivityYearGroup {
  year: number;
  entries: Activity[];
}

export function groupByYear(): ActivityYearGroup[] {
  const map = new Map<number, Activity[]>();
  for (const activity of ACTIVITIES) {
    const year = Number.parseInt(activity.date.slice(0, 4), 10);
    const bucket = map.get(year) ?? [];
    bucket.push(activity);
    map.set(year, bucket);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, entries]) => ({ year, entries }));
}

export const CATEGORY_LABEL: Record<ActivityCategory, string> = {
  project: 'Project',
  release: 'Release',
  talk: 'Talk',
  award: 'Award',
  job: 'Job',
  post: 'Post',
};

export const CATEGORY_ICON: Record<ActivityCategory, string> = {
  project: 'construction',
  release: 'rocket_launch',
  talk: 'campaign',
  award: 'military_tech',
  job: 'work',
  post: 'edit_note',
};

export const CATEGORY_COLOR: Record<ActivityCategory, string> = {
  project: 'bg-tertiary text-on-tertiary',
  release: 'bg-primary text-on-primary',
  talk: 'bg-secondary text-on-secondary',
  award: 'bg-primary-container text-on-primary-container border-2 border-primary',
  job: 'bg-tertiary-container text-on-tertiary-container border-2 border-tertiary',
  post: 'bg-surface-container-highest text-on-surface border-2 border-outline',
};

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${y}.${m}.${d}`;
}
