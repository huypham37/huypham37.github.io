import Link from 'next/link';
import ThemeSwitch from './ThemeSwitch';
import { site } from '@/lib/site';
import { slugify } from '@/lib/utils';
import type { Page } from '@/lib/types';

interface RailProps {
  groups: Record<string, Page[]>;
  /** URL of the page being viewed, used to mark the current entry. */
  currentUrl?: string;
}

export default function Rail({ groups, currentUrl }: RailProps) {
  const sections = Object.keys(groups);

  return (
    <aside className="rail">
      <Link className="rail__mark" href="/" aria-label={`${site.name} — home`}>
        <span className="rail__logo">
          <span className="logo-mark" role="img" aria-label={site.logoAlt} />
        </span>

      </Link>

      <nav className="rail__nav" aria-label="Sections">
        <Link href="/" aria-current={currentUrl === '/' ? 'page' : undefined}>
          Entrance
        </Link>

        {sections.map(section => {
          const active = groups[section].some(page => page.url === currentUrl);
          return (
            <Link
              key={section}
              href={`/#${slugify(section)}`}
              aria-current={active ? 'true' : undefined}
            >
              {section}
            </Link>
          );
        })}
      </nav>

      <div className="rail__foot">
        <ThemeSwitch />
      </div>
    </aside>
  );
}
