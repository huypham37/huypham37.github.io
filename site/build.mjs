import { mkdir, readdir, readFile, rm, writeFile, cp, access } from 'node:fs/promises';
import path from 'node:path';

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

const root = process.cwd();
const contentDir = path.join(root, 'writing');
const distDir = path.join(root, 'dist');

// Sections are driven by the top-level folder under the writing directory.
// This list controls the display label and the order they appear in.
const sections = [
  { dir: 'random', label: 'Random thought', blurb: 'Random thoughts about technology.' },
  { dir: 'blog', label: 'Blog', blurb: 'Essays and opinion pieces.' },
  { dir: 'quark', label: 'Quark', blurb: 'Notes on Quark, my coding agent.' },
  { dir: 'cs', label: 'CS', blurb: 'How basic computer science works.' }
];
const sectionOrder = sections.map(section => section.label);
const sectionLabel = dir => sections.find(section => section.dir === dir)?.label ?? titleCase(dir);
const sectionKicker = sections.map(section => section.label).join(' / ');

class Page {
  constructor(file, body) {
    this.file = file;
    this.slug = this.toSlug(file);
    const parsed = Frontmatter.parse(body);
    this.meta = parsed.meta;
    this.body = parsed.body;
  }

  toSlug(file) {
    // A page can be either folder/index.md or folder/folder.md.
    // Both forms publish at the folder path.
    const fromContent = path.relative(contentDir, file);
    const dir = path.dirname(fromContent);
    const name = path.basename(file, '.md');
    const relative = name === 'index' || name === path.basename(dir)
      ? dir
      : fromContent.replace(/\.md$/, '');
    return relative.split(path.sep).map(part => slugify(part)).join('/');
  }

  get sourceDir() {
    return path.dirname(this.file);
  }

  get section() {
    return this.meta.section || sectionLabel(this.slug.split('/')[0]);
  }

  get title() {
    return this.meta.title || titleCase(path.basename(this.slug));
  }

  get url() {
    return `/${this.slug}/`;
  }
}

class Frontmatter {
  static parse(source) {
    if (!source.startsWith('---')) return { meta: {}, body: source.trim() };

    const end = source.indexOf('\n---', 3);
    if (end < 0) return { meta: {}, body: source.trim() };

    const raw = source.slice(3, end).trim();
    const body = source.slice(end + 4).trim();
    const meta = {};

    for (const line of raw.split('\n')) {
      const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (match) meta[match[1]] = unquote(match[2].trim());
    }

    return { meta, body };
  }
}

class Markdown {
  render(source) {
    const notes = [];
    const withoutNotes = source.replace(/^\[\^(.+?)\]:\s+(.+)$/gm, (_, id, text) => {
      notes.push({ id, text });
      return '';
    });

    return {
      html: this.blocks(withoutNotes),
      notes: notes.map((note, index) => ({
        num: index + 1,
        html: this.inline(note.text)
      }))
    };
  }

  blocks(source) {
    const lines = source.split('\n');
    const html = [];
    let paragraph = [];
    let code = null;

    const flush = () => {
      if (!paragraph.length) return;
      html.push(`<p>${this.inline(paragraph.join(' '))}</p>`);
      paragraph = [];
    };

    for (const line of lines) {
      if (line.startsWith('```')) {
        if (code) {
          html.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
          code = null;
        } else {
          flush();
          code = [];
        }
        continue;
      }

      if (code) {
        code.push(line);
        continue;
      }

      const heading = line.match(/^(#{2,3})\s+(.+)$/);
      if (heading) {
        flush();
        const level = heading[1].length;
        const text = heading[2].trim();
        const id = slugify(text);
        html.push(`<h${level} id="${id}">${this.inline(text)}</h${level}>`);
        continue;
      }

      // A standalone image on its own line becomes a block-level <figure>,
      // with an optional "caption" rendered as <figcaption>.
      const image = line.trim().match(/^!\[([^\]]*)\]\(\s*([^)\s]+)(?:\s+"([^"]*)")?\s*\)$/);
      if (image) {
        flush();
        html.push(this.figure(image[1], image[2], image[3]));
        continue;
      }

      if (!line.trim()) {
        flush();
        continue;
      }

      paragraph.push(line.trim());
    }

    flush();
    return html.join('\n');
  }

  figure(alt, src, caption) {
    const cap = caption ? `\n    <figcaption>${this.inline(caption)}</figcaption>` : '';
    return `<figure>\n    <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />${cap}\n  </figure>`;
  }

  inline(source) {
    return escapeHtml(source)
      .replace(/\[\^(.+?)\]/g, '<sup class="ref">$1</sup>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:[^)]*)?\)/g, '<img src="$2" alt="$1" />')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="tx" href="$2">$1</a>');
  }
}

class Site {
  constructor(pages) {
    this.pages = pages.sort(comparePages);
    this.markdown = new Markdown();
  }

  async build() {
    await rm(distDir, { recursive: true, force: true });
    await mkdir(distDir, { recursive: true });
    await cp(path.join(root, 'styles'), path.join(distDir, 'styles'), { recursive: true });
    await cp(path.join(root, 'scripts'), path.join(distDir, 'scripts'), { recursive: true });
    await cp(path.join(root, 'assets'), path.join(distDir, 'assets'), { recursive: true });
    await this.writeIndex();

    for (const page of this.pages) await this.writePage(page);
  }

  async writeIndex() {
    const groups = this.groups();
    const body = Object.entries(groups).map(([section, pages]) => `
      <h2 id="${slugify(section)}"><span class="num">§</span>${escapeHtml(section)}</h2>
      ${pages.map(page => `<p><a class="tx" href="./${page.slug}/">${escapeHtml(page.title)}</a></p>`).join('\n')}
    `).join('\n');

    const html = this.layout({
      title: 'Index',
      displayTitle: 'reinventthewheel',
      section: 'Index',
      description: 'A quiet index for Random, Blog, Quark, and CS.',
      date: '2026-05-17',
      status: 'Draft',
      body,
      currentUrl: '/'
    });

    await writeFile(path.join(distDir, 'index.html'), html);
  }

  async writePage(page) {
    const rendered = this.markdown.render(page.body);
    const index = this.pages.indexOf(page);
    const html = this.layout({
      title: page.title,
      section: page.section,
      description: page.meta.description || '',
      date: page.meta.date || '',
      status: page.meta.status || 'Draft',
      body: rendered.html,
      notes: rendered.notes,
      currentUrl: page.url,
      prev: this.pages[index - 1],
      next: this.pages[index + 1]
    });

    const dir = path.join(distDir, page.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), html);

    // Copy the bundle's own assets/ alongside its HTML so relative
    // image paths (e.g. assets/diagram.png) resolve correctly.
    const assets = path.join(page.sourceDir, 'assets');
    if (await exists(assets)) {
      await cp(assets, path.join(dir, 'assets'), { recursive: true });
    }
  }

  layout(data) {
    const prefix = this.prefix(data.currentUrl);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(data.title)} — reinventthewheel</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${prefix}styles/page.css" />
</head>
<body>
  <svg class="page-mark" width="21" height="21" viewBox="0 0 30 30" fill="none" aria-hidden="true">
    <circle cx="15" cy="15" r="14" stroke="currentColor"/>
    <line x1="7" y1="11" x2="23" y2="11" stroke="currentColor"/>
    <line x1="7" y1="15" x2="23" y2="15" stroke="currentColor"/>
    <line x1="7" y1="19" x2="19" y2="19" stroke="currentColor"/>
  </svg>
  ${this.sidebar(data.currentUrl, prefix)}
  <nav class="page-toc" data-page-toc aria-label="On this page"></nav>
  <main class="sheet">
    <section class="title-block">
      <div class="meta">${wordCount(data.body)} words</div>
      <h1>${escapeHtml(data.displayTitle || data.title)}</h1>
      ${data.description ? `<div class="sub">${escapeHtml(data.description)}</div>` : ''}
      <div class="rule" aria-hidden="true">—————</div>
    </section>
    <div class="article">
      <div class="body">
        ${data.body}
      </div>
      ${this.notes(data.notes)}
    </div>
    ${this.pagination(data.prev, data.next, prefix)}
  </main>
  <script type="module" src="${prefix}scripts/page.js"></script>
</body>
</html>
`;
  }

  sidebar(currentUrl, prefix) {
    return `<aside class="writing-sidebar" aria-label="Site index">
    <a class="writing-sidebar__logo" href="${prefix}">reinvent<br>thewheel</a>
    <div class="writing-toc">
      ${Object.entries(this.groups()).map(([section, pages], index) => `
        <section class="toc-section" aria-labelledby="toc-${slugify(section)}">
          <h2 id="toc-${slugify(section)}"><span class="num">${index + 1}.</span>${escapeHtml(section)}</h2>
          <ul>
            ${pages.map(page => {
              const current = page.url === currentUrl;
              return `<li class="${current ? 'is-current' : ''}"><a href="${prefix}${page.slug}/" ${current ? 'aria-current="page"' : ''}>${escapeHtml(page.title)}</a></li>`;
            }).join('\n')}
          </ul>
        </section>
      `).join('\n')}
    </div>
  </aside>`;
  }

  notes(notes = []) {
    if (!notes.length) return '';
    return `<aside class="sidenotes">
      ${notes.map(note => `<div class="sidenote"><span class="num">${note.num}</span>${note.html}</div>`).join('\n')}
    </aside>`;
  }

  pagination(prev, next, prefix) {
    return `<nav class="pagination">
      <a class="left" href="${prev ? `${prefix}${prev.slug}/` : prefix}">${prev ? `prev · ${escapeHtml(prev.title)}` : 'index'}</a>
      <a class="center" href="${prefix}">index</a>
      <a class="right" href="${next ? `${prefix}${next.slug}/` : prefix}">${next ? `next · ${escapeHtml(next.title)}` : 'index'}</a>
    </nav>`;
  }

  groups() {
    const groups = this.pages.reduce((groups, page) => {
      groups[page.section] ||= [];
      groups[page.section].push(page);
      return groups;
    }, {});

    return Object.fromEntries(Object.entries(groups).sort(([a], [b]) => sectionIndex(a) - sectionIndex(b)));
  }

  prefix(url) {
    const depth = url === '/' ? 0 : url.split('/').filter(Boolean).length;
    return depth === 0 ? './' : '../'.repeat(depth);
  }
}

class Content {
  static async pages(dir = contentDir) {
    const files = await this.files(dir);
    const pages = [];

    for (const file of files) {
      pages.push(new Page(file, await readFile(file, 'utf8')));
    }

    return pages;
  }

  static async files(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) files.push(...await this.files(full));
      if (entry.isFile() && entry.name.endsWith('.md')) files.push(full);
    }

    return files;
  }
}

function unquote(value = '') {
  const quote = value[0];
  return (quote === '"' || quote === "'") && value.at(-1) === quote
    ? value.slice(1, -1)
    : value;
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function titleCase(value) {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

function sectionIndex(section) {
  const index = sectionOrder.indexOf(section);
  return index < 0 ? sectionOrder.length : index;
}

function comparePages(a, b) {
  return sectionIndex(a.section) - sectionIndex(b.section) ||
    (Number(a.meta.order) || 0) - (Number(b.meta.order) || 0) ||
    a.slug.localeCompare(b.slug);
}

function wordCount(html) {
  return html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
}

new Site(await Content.pages()).build();
