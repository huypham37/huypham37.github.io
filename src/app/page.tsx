import Link from 'next/link';
import PageShell from '@/components/PageShell';
import Sheet from '@/components/Sheet';
import TitleBlock from '@/components/TitleBlock';
import { getPageGroups } from '@/lib/content';
import { slugify } from '@/lib/utils';

export default async function IndexPage() {
  const groups = await getPageGroups();

  return (
    <PageShell groups={groups} currentUrl="/">
      <Sheet>
        <TitleBlock title="reinventthewheel" description="A quiet index for Random, Blog, Quark, and CS." />
        <div className="article">
          <div className="body">
            {Object.entries(groups).map(([section, pages]) => (
              <section key={section}>
                <h2 id={slugify(section)}>
                  <span className="num">§</span>
                  {section}
                </h2>
                {pages.map(page => (
                  <p key={page.slug}>
                    <Link className="tx" href={page.url}>
                      {page.title}
                    </Link>
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </Sheet>
    </PageShell>
  );
}
