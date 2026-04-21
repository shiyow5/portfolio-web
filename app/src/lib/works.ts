import raw from '../data/works.json';

export type WorkCategory = 'game' | 'uiux' | 'web' | 'art' | 'prototype';

export type WorkStatus = 'new' | 'stable' | 'wip';

export interface WorkLinks {
  play?: string;
  demo?: string;
  github?: string;
}

export interface Work {
  id: string;
  title: string;
  category: WorkCategory;
  tagline: string;
  description: string;
  cover: string;
  gallery: string[];
  tags: string[];
  tech: string[];
  version: string;
  status: WorkStatus;
  year: number;
  links: WorkLinks;
}

export const WORKS: Work[] = raw as Work[];

export const CATEGORY_LABEL: Record<WorkCategory | 'all', string> = {
  all: 'All Quests',
  game: 'Games',
  uiux: 'UI / UX',
  web: 'Web Crafts',
  art: '2D Art',
  prototype: 'Prototypes',
};

export function findWork(id: string | undefined): Work | undefined {
  if (!id) return undefined;
  return WORKS.find((work) => work.id === id);
}

export function filterByCategory(category: WorkCategory | 'all'): Work[] {
  if (category === 'all') return WORKS;
  return WORKS.filter((work) => work.category === category);
}

export function listCategories(): Array<WorkCategory | 'all'> {
  const set = new Set<WorkCategory>();
  for (const work of WORKS) set.add(work.category);
  return ['all', ...Array.from(set).sort()];
}
