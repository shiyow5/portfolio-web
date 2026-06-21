import raw from '../data/profile.json';

export interface TechStackGroup {
  id: string;
  label: string;
  items: string[];
}

export interface Profile {
  name: string;
  classTitle: string;
  location: string;
  techStack: TechStackGroup[];
}

export const PROFILE: Profile = raw as Profile;
