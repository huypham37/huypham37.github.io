export type PageMeta = Record<string, string>;

export interface Page {
  file: string;
  slug: string;
  meta: PageMeta;
  body: string;
  section: string;
  title: string;
  url: string;
  sourceDir: string;
}

export interface Note {
  num: number;
  html: string;
}

export interface RenderedPage {
  html: string;
  notes: Note[];
}

export interface SectionConfig {
  dir: string;
  label: string;
  blurb: string;
}
