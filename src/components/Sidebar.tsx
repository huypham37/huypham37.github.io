import Link from 'next/link';
import { slugify } from '@/lib/utils';
import type { Page } from '@/lib/types';

interface SidebarProps {
  groups: Record<string, Page[]>;
  currentUrl?: string;
  isOpen?: boolean;
}

export default function Sidebar({ groups, currentUrl = '', isOpen = false }: SidebarProps) {
  return (
    <aside className={`writing-sidebar ${isOpen ? 'is-open' : ''}`} aria-label="Site index">
      <Link className="writing-sidebar__logo" href="/">
        reinvent
        <br />
        thewheel
      </Link>
      <div className="writing-toc">
        {Object.entries(groups).map(([section, pages], index) => (
          <section className="toc-section" key={section} aria-labelledby={`toc-${slugify(section)}`}>
            <h2 id={`toc-${slugify(section)}`}>
              <span className="num">{index + 1}.</span>
              {section}
            </h2>
            <ul>
              {pages.map(page => {
                const current = page.url === currentUrl;
                return (
                  <li key={page.slug} className={current ? 'is-current' : ''}>
                    <Link href={page.url} aria-current={current ? 'page' : undefined}>
                      {page.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </aside>
  );
}
