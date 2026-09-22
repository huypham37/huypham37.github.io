import { escapeHtml, slugify } from './utils';
import type { Note, RenderedPage } from './types';

/** Heading levels we emit. `#` is demoted because the page template already
 *  renders the title as an <h1>. */
const HEADING_LEVEL: Record<number, number> = { 1: 2, 2: 2, 3: 3, 4: 4 };

const RE_HEADING = /^(#{1,4})\s+(.+?)\s*$/;
const RE_RULE = /^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/;
const RE_QUOTE = /^\s{0,3}>\s?(.*)$/;
const RE_BULLET = /^\s{0,3}[-*+]\s+(.+?)\s*$/;
const RE_ORDERED = /^\s{0,3}\d+[.)]\s+(.+?)\s*$/;
const RE_IMAGE = /^!\[([^\]]*)\]\(\s*([^)\s]+)(?:\s+"([^"]*)")?\s*\)$/;

export function renderMarkdown(source: string): RenderedPage {
  const notes: Array<{ id: string; text: string }> = [];
  const withoutNotes = source.replace(/^\[\^(.+?)\]:\s+(.+)$/gm, (_, id: string, text: string) => {
    notes.push({ id, text });
    return '';
  });

  return {
    html: blocks(withoutNotes),
    notes: notes.map((note, index) => ({
      num: index + 1,
      html: inline(note.text)
    }))
  };
}

function blocks(source: string): string {
  const lines = source.split('\n');
  const html: string[] = [];

  let paragraph: string[] = [];
  let quote: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let code: string[] | null = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inline(paragraph.join(' '))}</p>`);
    paragraph = [];
  };

  const flushQuote = () => {
    if (!quote.length) return;
    html.push(`<blockquote>${quote.map(line => `<p>${inline(line)}</p>`).join('')}</blockquote>`);
    quote = [];
  };

  const flushList = () => {
    if (!list) return;
    const tag = list.ordered ? 'ol' : 'ul';
    html.push(`<${tag}>${list.items.map(item => `<li>${inline(item)}</li>`).join('')}</${tag}>`);
    list = null;
  };

  const flush = () => {
    flushParagraph();
    flushQuote();
    flushList();
  };

  for (const line of lines) {
    if (line.startsWith('```')) {
      flush();
      if (code) {
        html.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
        code = null;
      } else {
        code = [];
      }
      continue;
    }

    if (code) {
      code.push(line);
      continue;
    }

    if (!line.trim()) {
      flush();
      continue;
    }

    const heading = line.match(RE_HEADING);
    if (heading) {
      flush();
      const level = HEADING_LEVEL[heading[1].length];
      const text = heading[2];
      html.push(`<h${level} id="${slugify(text)}">${inline(text)}</h${level}>`);
      continue;
    }

    if (RE_RULE.test(line)) {
      flush();
      html.push('<hr />');
      continue;
    }

    const quoted = line.match(RE_QUOTE);
    if (quoted) {
      flushParagraph();
      flushList();
      quote.push(quoted[1]);
      continue;
    }

    const bullet = line.match(RE_BULLET);
    const ordered = bullet ? null : line.match(RE_ORDERED);
    if (bullet || ordered) {
      flushParagraph();
      flushQuote();
      const isOrdered = Boolean(ordered);
      if (!list || list.ordered !== isOrdered) {
        flushList();
        list = { ordered: isOrdered, items: [] };
      }
      list.items.push((bullet ?? ordered)![1]);
      continue;
    }

    const image = line.trim().match(RE_IMAGE);
    if (image) {
      flush();
      html.push(figure(image[1], image[2], image[3]));
      continue;
    }

    // a plain line continues whatever block is open
    if (quote.length) {
      quote.push(line.trim());
      continue;
    }

    if (list) {
      // lazy continuation of the previous list item
      list.items[list.items.length - 1] += ` ${line.trim()}`;
      continue;
    }

    paragraph.push(line.trim());
  }

  flush();
  return html.join('\n');
}

function figure(alt: string, src: string, caption?: string): string {
  const cap = caption ? `\n    <figcaption>${inline(caption)}</figcaption>` : '';
  return `<figure>\n    <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />${cap}\n  </figure>`;
}

function inline(source: string): string {
  return escapeHtml(source)
    // footnote references claim the brackets before backslash-unescaping,
    // otherwise an escaped \[^1\] would turn into a live reference
    .replace(/\[\^(.+?)\]/g, '<sup class="ref">$1</sup>')
    .replace(/\\([\\`*_{}[\]()#+\-.!])/g, '$1')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:[^)]*)?\)/g, '<img src="$2" alt="$1" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="tx" href="$2">$1</a>');
}
