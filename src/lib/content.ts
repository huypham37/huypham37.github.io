import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { renderMarkdown } from './markdown';
import { slugify, titleCase, unquote } from './utils';
import type { Page, PageMeta, SectionConfig } from './types';

const contentDir = path.join(process.cwd(), 'writing');

export const sections: SectionConfig[] = [
  { dir: 'random', label: 'Random thought', blurb: 'Random thoughts about technology.' },
  { dir: 'blog', label: 'Blog', blurb: 'Essays and opinion pieces.' },
  { dir: 'quark', label: 'Quark', blurb: 'Notes on Quark, my coding agent.' },
  { dir: 'cs', label: 'CS', blurb: 'How basic computer science works.' }
];

const sectionOrder = sections.map(section => section.label);

function sectionLabel(dir: string): string {
  return sections.find(section => section.dir === dir)?.label ?? titleCase(dir);
}

function sectionIndex(section: string): number {
  const index = sectionOrder.indexOf(section);
  return index < 0 ? sectionOrder.length : index;
}

function comparePages(a: Page, b: Page): number {
  return sectionIndex(a.section) - sectionIndex(b.section) ||
    (Number(a.meta.order) || 0) - (Number(b.meta.order) || 0) ||
    a.slug.localeCompare(b.slug);
}

function parseFrontmatter(source: string): { meta: PageMeta; body: string } {
  if (!source.startsWith('---')) return { meta: {}, body: source.trim() };

  const end = source.indexOf('\n---', 3);
  if (end < 0) return { meta: {}, body: source.trim() };

  const raw = source.slice(3, end).trim();
  const body = source.slice(end + 4).trim();
  const meta: PageMeta = {};

  for (const line of raw.split('\n')) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match) meta[match[1]] = unquote(match[2].trim());
  }

  return { meta, body };
}

function toSlug(file: string): string {
  const fromContent = path.relative(contentDir, file);
  const dir = path.dirname(fromContent);
  const name = path.basename(file, '.md');
  const relative = name === 'index' || name === path.basename(dir)
    ? dir
    : fromContent.replace(/\.md$/, '');
  return relative.split(path.sep).map(part => slugify(part)).join('/');
}

function createPage(file: string, source: string): Page {
  const parsed = parseFrontmatter(source);
  const slug = toSlug(file);

  return {
    file,
    slug,
    meta: parsed.meta,
    body: parsed.body,
    section: parsed.meta.section || sectionLabel(slug.split('/')[0]),
    title: parsed.meta.title || titleCase(path.basename(slug)),
    url: `/${slug}/`,
    sourceDir: path.dirname(file)
  };
}

async function allFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const result: string[] = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await allFiles(full));
    if (entry.isFile() && entry.name.endsWith('.md')) result.push(full);
  }

  return result;
}

export async function getPages(): Promise<Page[]> {
  const filePaths = await allFiles(contentDir);
  const pages: Page[] = [];

  for (const file of filePaths) {
    const source = await readFile(file, 'utf8');
    pages.push(createPage(file, source));
  }

  return pages.sort(comparePages);
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const pages = await getPages();
  return pages.find(page => page.slug === slug) ?? null;
}

export async function getPageGroups(): Promise<Record<string, Page[]>> {
  const pages = await getPages();
  const groups: Record<string, Page[]> = {};

  for (const page of pages) {
    groups[page.section] ||= [];
    groups[page.section].push(page);
  }

  return Object.fromEntries(
    Object.entries(groups).sort(([a], [b]) => sectionIndex(a) - sectionIndex(b))
  );
}

export function renderPageBody(body: string) {
  return renderMarkdown(body);
}
