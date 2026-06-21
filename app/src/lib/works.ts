import raw from '../data/works.json';

export interface WorkSource {
  label: string;
  url: string;
}

export interface WorkLinks {
  github?: string;
  demo?: string;
  play?: string;
  /** Labeled source/reference links (official event page, press, competition). */
  sources?: WorkSource[];
}

export interface Work {
  id: string;
  title: string;
  tagline: string;
  tech: string[];
  /** Short free-form status label, e.g. "優秀賞 · Team" / "公開 · 個人". */
  status: string;
  year: number;
  links: WorkLinks;
}

export const WORKS: Work[] = raw as Work[];
