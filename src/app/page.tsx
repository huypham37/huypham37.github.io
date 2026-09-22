import Link from 'next/link';
import { Fragment } from 'react';
import SiteShell from '@/components/SiteShell';
import Footer from '@/components/Footer';
import { getIntro, getPageGroups, renderPageBody } from '@/lib/content';
import { site } from '@/lib/site';
import { reveal } from '@/lib/reveal';
import { readTime, slugify } from '@/lib/utils';

export default async function IndexPage() {
  const [groups, intro] = await Promise.all([getPageGroups(), getIntro()]);
  const introHtml = renderPageBody(intro).html;

  return (
    <SiteShell groups={groups} currentUrl="/">
      <section className="hero">
        <p className="eyebrow reveal" style={reveal(0)}>
          {site.eyebrow}
        </p>

        <h1 className="reveal" style={reveal(1)}>
          {site.greeting}
        </h1>

        <div
          className="intro reveal"
          style={reveal(2)}
          dangerouslySetInnerHTML={{ __html: introHtml }}
        />
      </section>

      <div className="rule" />

      <section className="reveal" style={reveal(3)}>
        <div className="section-head">
          <h2>Currently</h2>
          <span>a quiet snapshot</span>
        </div>

        <dl className="now">
          {site.now.map(entry => (
            <Fragment key={entry.label}>
              <dt>{entry.label}</dt>
              <dd>
                {entry.href ? <Link href={entry.href}>{entry.text}</Link> : entry.text}
              </dd>
            </Fragment>
          ))}
        </dl>
      </section>

      {Object.entries(groups).map(([section, pages], index) => (
        <section className="entries reveal" key={section} id={slugify(section)} style={reveal(4 + index)}>
          <div className="section-head">
            <h2>{section}</h2>
            <span>
              {pages.length} {pages.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          {pages.map(page => (
            <Link className="entry" key={page.slug} href={page.url}>
              <div className="entry__meta">{readTime(page.body)} min read</div>
              <div>
                <h3 className="entry__title">{page.title}</h3>
                {page.meta.description && (
                  <p className="entry__desc">{page.meta.description}</p>
                )}
              </div>
              <div className="entry__view">View</div>
            </Link>
          ))}
        </section>
      ))}

      <Footer index={4 + Object.keys(groups).length} />
    </SiteShell>
  );
}
