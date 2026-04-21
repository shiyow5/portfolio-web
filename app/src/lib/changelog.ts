import raw from '../data/changelog.json';

export type ChangeKind = 'feature' | 'fix' | 'chore' | 'ci' | 'docs';

export interface ChangeEntry {
  kind: ChangeKind;
  text: string;
}

export type ReleaseStatus = 'planned' | 'stable' | 'wip';

export interface Release {
  version: string;
  codename: string;
  date: string;
  status: ReleaseStatus;
  summary: string;
  entries: ChangeEntry[];
  tags: string[];
}

export const RELEASES: Release[] = raw as Release[];
