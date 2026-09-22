/**
 * Copy and shapes for the recruiter sheet.
 *
 * Client-safe on purpose: this module is imported by a client component, so it
 * holds no filesystem code. The work-experience and project *data* lives in
 * content/*.yaml and is turned into these shapes by recruiter-data.ts, which
 * only the server may import.
 */

export type Locale = 'en' | 'nl';

export const locales: Locale[] = ['en', 'nl'];

/** One field, written once per locale. */
export type Text = Record<Locale, string>;

export interface SelectedWork {
  name: string;
  detail: string;
}

export interface Role {
  company: string;
  title: string;
  duration: string;
  /** Two-letter plate standing in for a logo, as on a drawing title block. */
  mark: string;
  /** URL of a real logo, served from public/. Falls back to `mark`. */
  logo?: string;
  summary: string;
  highlights: string[];
  selected?: SelectedWork[];
  tech: string[];
}

export interface Project {
  type: string;
  duration: string;
  name: string;
  mark: string;
  summary: string;
  tech: string[];
  /** Absent when there is nothing public to link to yet. */
  href?: string;
}

/** Section headings and buttons — the chrome around the data. */
export interface Labels {
  kicker: string;
  heading: string;
  lede: string;
  contactLabel: string;
  toggleLabel: string;
  viewProject: string;
  experience: { label: string; heading: string };
  projects: { label: string; heading: string };
  selectedLabel: string;
}

/** Everything one locale of the page needs. */
export interface Sheet extends Labels {
  roles: Role[];
  work: Project[];
}

export const labels: Record<Locale, Labels> = {
  en: {
    kicker: 'For recruiters',
    heading: 'A quick view of what I’ve worked on.',
    lede: 'I’m a software engineer focused on building applications and the infrastructure around them — from product code and internal tooling to cloud-native systems, automation, and AI experiments.',
    contactLabel: 'Contact me',
    toggleLabel: 'Language',
    viewProject: 'View project',
    experience: { label: 'Experience', heading: 'Where I’ve worked' },
    projects: { label: 'Selected projects', heading: 'Things I build outside work' },
    selectedLabel: 'Selected work'
  },
  nl: {
    kicker: 'Voor recruiters',
    heading: 'Een kort overzicht van waar ik aan heb gewerkt.',
    lede: 'Ik ben software engineer en richt me op het bouwen van applicaties en de infrastructuur eromheen — van productcode en interne tooling tot cloud-native systemen, automatisering en AI-experimenten.',
    contactLabel: 'Neem contact op',
    toggleLabel: 'Taal',
    viewProject: 'Bekijk project',
    experience: { label: 'Ervaring', heading: 'Waar ik heb gewerkt' },
    projects: { label: 'Geselecteerde projecten', heading: 'Dingen die ik buiten werk bouw' },
    selectedLabel: 'Geselecteerd werk'
  }
};
