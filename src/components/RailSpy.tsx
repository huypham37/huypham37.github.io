'use client';

import { useEffect } from 'react';
import { slugify } from '@/lib/utils';

interface RailSpyProps {
  /** Section labels, in rail order — the same strings Rail renders as links. */
  sections: string[];
}

/** Scroll reserved for each section that can never reach the reading line. */
const TAIL_STEP = 48;

/**
 * The rail links are anchors on the entrance page (`/#blog`), not routes, so the
 * server can only ever mark one of them: "Entrance", because the URL never
 * changes. This hands that job to the scroll position instead — whichever
 * section has passed the reading line takes the dot, and Entrance keeps it
 * while the hero is still on screen.
 *
 * The marking is applied straight to the DOM: it changes on every scroll frame,
 * and routing it through state would re-render the whole rail sixty times a
 * second for one attribute.
 */
export default function RailSpy({ sections }: RailSpyProps) {
  useEffect(() => {
    const nav = document.querySelector('.rail__nav');
    if (!nav) return;

    const entrance = nav.querySelector<HTMLAnchorElement>('a[href="/"]');
    // flatMap rather than map+filter, so both halves are non-null below.
    const marks = sections.flatMap(label => {
      const target = document.getElementById(slugify(label));
      const link = nav.querySelector<HTMLAnchorElement>(`a[href="/#${slugify(label)}"]`);
      return target && link ? [{ target, link }] : [];
    });

    // No section anchors on this page (an article, say) — nothing to spy on.
    if (!entrance || marks.length === 0) return;
    const entranceLink: HTMLAnchorElement = entrance;

    let offsets: number[] = [];
    let activeLink: HTMLAnchorElement | null = null;
    let frame = 0;

    // Document-top offsets are cached, so a scroll frame never calls
    // getBoundingClientRect on more than the cached numbers.
    const rebase = () => {
      const scrollY = window.scrollY;
      offsets = marks.map(({ target }) => target.getBoundingClientRect().top + scrollY);
    };

    const apply = () => {
      frame = 0;

      // A section counts as current once its heading passes this line.
      const line = window.innerHeight * 0.35;
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        0
      );

      // Sections near the end of a short page can never reach the line on their
      // own — there is not enough scroll left. Compress their thresholds into
      // the tail instead, so the last one still activates at the bottom.
      const thresholds = offsets.map(offset => offset - line);
      for (let i = thresholds.length - 1; i >= 0; i--) {
        const cap = maxScroll - TAIL_STEP * (thresholds.length - 1 - i);
        if (thresholds[i] > cap) thresholds[i] = cap;
      }

      let next: HTMLAnchorElement = entranceLink;
      for (let i = 0; i < thresholds.length; i++) {
        if (window.scrollY >= thresholds[i]) next = marks[i].link;
      }
      if (next === activeLink) return;

      activeLink = next;
      for (const { link } of marks) link.removeAttribute('aria-current');
      entranceLink.removeAttribute('aria-current');
      next.setAttribute('aria-current', next === entranceLink ? 'page' : 'true');
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const rebaseAndSchedule = () => {
      rebase();
      schedule();
    };

    rebase();
    apply();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', rebaseAndSchedule);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', rebaseAndSchedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [sections]);

  return null;
}
