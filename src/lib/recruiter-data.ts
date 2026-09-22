import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'yaml';
import {
  labels,
  type Locale,
  type Project,
  type Role,
  type Sheet,
  type Text
} from './recruiter';

/**
 * Controller for the two YAML files behind /for-recruiter/.
 *
 * Server-only — it reads from disk, so it must never be imported by a client
 * component. Everything it returns is plain JSON-shaped data, which is what
 * the page hands to the client toggle.
 *
 * The YAML is hand-edited, so every field is checked here and a mistake names
 * the file and the path inside it instead of surfacing as `undefined` in the
 * markup.
 */

const contentDir = path.join(process.cwd(), 'content');

function fail(file: string, where: string, expected: string): never {
  throw new Error(`content/${file} → ${where}: expected ${expected}`);
}

/** Both locales of one record, built from the same validated source. */
function both<T>(make: (locale: Locale) => T): Record<Locale, T> {
  return { en: make('en'), nl: make('nl') };
}

function asObject(file: string, value: unknown, where: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(file, where, 'a mapping');
  }
  return value as Record<string, unknown>;
}

function asList(file: string, value: unknown, where: string): unknown[] {
  if (!Array.isArray(value) || !value.length) {
    fail(file, where, 'a non-empty list');
  }
  return value;
}

function asString(file: string, value: unknown, where: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    fail(file, where, 'a non-empty string');
  }
  return value;
}

/** A field written once per locale, e.g. `title: { en: …, nl: … }`. */
function asText(file: string, value: unknown, where: string): Text {
  const map = asObject(file, value, where);
  return both(locale => asString(file, map[locale], `${where}.${locale}`));
}

function asTextList(file: string, value: unknown, where: string): Text[] {
  return asList(file, value, where)
    .map((item, index) => asText(file, item, `${where}[${index + 1}]`));
}

function asStringList(file: string, value: unknown, where: string): string[] {
  return asList(file, value, where)
    .map((item, index) => asString(file, item, `${where}[${index + 1}]`));
}

function asOptionalString(file: string, value: unknown, where: string): string | undefined {
  return value === undefined || value === null ? undefined : asString(file, value, where);
}

function role(file: string, raw: unknown, index: number): Record<Locale, Role> {
  const where = `role ${index + 1}`;
  const source = asObject(file, raw, where);

  const company = asString(file, source.company, `${where}.company`);
  const mark = asString(file, source.mark, `${where}.mark`);
  const title = asText(file, source.title, `${where}.title`);
  const duration = asText(file, source.duration, `${where}.duration`);
  const summary = asText(file, source.summary, `${where}.summary`);
  const highlights = asTextList(file, source.highlights, `${where}.highlights`);
  const tech = asStringList(file, source.tech, `${where}.tech`);

  const selected = source.selected === undefined || source.selected === null
    ? undefined
    : asList(file, source.selected, `${where}.selected`).map((item, i) => {
      const at = `${where}.selected[${i + 1}]`;
      const row = asObject(file, item, at);
      return {
        name: asText(file, row.name, `${at}.name`),
        detail: asText(file, row.detail, `${at}.detail`)
      };
    });

  return both(locale => ({
    company,
    mark,
    tech,
    title: title[locale],
    duration: duration[locale],
    summary: summary[locale],
    highlights: highlights.map(highlight => highlight[locale]),
    selected: selected?.map(item => ({ name: item.name[locale], detail: item.detail[locale] }))
  }));
}

function project(file: string, raw: unknown, index: number): Record<Locale, Project> {
  const where = `project ${index + 1}`;
  const source = asObject(file, raw, where);

  const mark = asString(file, source.mark, `${where}.mark`);
  const type = asText(file, source.type, `${where}.type`);
  const name = asText(file, source.name, `${where}.name`);
  const duration = asText(file, source.duration, `${where}.duration`);
  const summary = asText(file, source.summary, `${where}.summary`);
  const tech = asStringList(file, source.tech, `${where}.tech`);
  const href = asOptionalString(file, source.href, `${where}.href`);

  return both(locale => ({
    mark,
    tech,
    href,
    type: type[locale],
    name: name[locale],
    duration: duration[locale],
    summary: summary[locale]
  }));
}

async function readYaml(file: string): Promise<unknown> {
  const source = await readFile(path.join(contentDir, file), 'utf8');
  try {
    return parse(source);
  } catch (error) {
    throw new Error(`content/${file}: ${(error as Error).message}`);
  }
}

const EXPERIENCE_FILE = 'work-experience.yaml';
const PROJECTS_FILE = 'projects.yaml';

const readRoles = (value: unknown) =>
  asList(EXPERIENCE_FILE, value, 'top level')
    .map((raw, index) => role(EXPERIENCE_FILE, raw, index));

const readProjects = (value: unknown) =>
  asList(PROJECTS_FILE, value, 'top level')
    .map((raw, index) => project(PROJECTS_FILE, raw, index));

/** Both locales of the whole sheet, ready to hand to the client toggle. */
export async function getRecruiterSheets(): Promise<Record<Locale, Sheet>> {
  const [experience, projects] = await Promise.all([
    readYaml(EXPERIENCE_FILE),
    readYaml(PROJECTS_FILE)
  ]);

  const roles = readRoles(experience);
  const work = readProjects(projects);

  return both(locale => ({
    ...labels[locale],
    roles: roles.map(entry => entry[locale]),
    work: work.map(entry => entry[locale])
  }));
}
