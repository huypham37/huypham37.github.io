import { escapeHtml, slugify } from './utils';
import type { Note, RenderedPage } from './types';

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
  let code: string[] | null = null;

  const flush = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inline(paragraph.join(' '))}</p>`);
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
      html.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      continue;
    }

    const image = line.trim().match(/^!\[([^\]]*)\]\(\s*([^)\s]+)(?:\s+"([^"]*)")?\s*\)$/);
    if (image) {
      flush();
      html.push(figure(image[1], image[2], image[3]));
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

function figure(alt: string, src: string, caption?: string): string {
  const cap = caption ? `\n    <figcaption>${inline(caption)}</figcaption>` : '';
  return `<figure>\n    <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />${cap}\n  </figure>`;
}

function inline(source: string): string {
  return escapeHtml(source)
    .replace(/\[\^(.+?)\]/g, '<sup class="ref">$1</sup>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:[^)]*)?\)/g, '<img src="$2" alt="$1" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="tx" href="$2">$1</a>');
}
