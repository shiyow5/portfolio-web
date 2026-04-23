import raw from '../data/profile.json';

export type StatColor = 'primary' | 'secondary' | 'tertiary';

export interface Stat {
  label: string;
  value: number;
  max: number;
  color: StatColor;
}

export interface TechStackGroup {
  id: string;
  label: string;
  icon: string;
  items: string[];
}

export interface HistoryEntry {
  year: number;
  title: string;
  detail: string;
}

export interface Profile {
  name: string;
  classTitle: string;
  level: number;
  xp: number;
  xpNext: number;
  location: string;
  bioQuote: string;
  stats: Stat[];
  techStack: TechStackGroup[];
  perks: string[];
  history: HistoryEntry[];
}

export const PROFILE: Profile = raw as Profile;
