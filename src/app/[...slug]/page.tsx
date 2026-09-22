import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import SiteShell from '@/components/SiteShell';
import PageHead from '@/components/PageHead';
import Article from '@/components/Article';
import Pagination from '@/components/Pagination';
import ClientScripts from '@/components/ClientScripts';
import { getPages, getPageBySlug, getPageGroups, renderPageBody } from '@/lib/content';
import { site } from '@/lib/site';
import type { Page } from '@/lib/types';

interface ArticlePageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  const pages = await getPages();
  return pages.map(page => ({
    slug: page.slug.split('/')
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug.join('/'));

  if (!page) {
    return { title: 'Not found' };
  }

  return {
    title: `${page.title} — ${site.name}`,
    description: page.meta.description || ''
  };
}

function findNeighbors(pages: Page[], current: Page) {
  const index = pages.findIndex(page => page.slug === current.slug);
  return {
    prev: index > 0 ? pages[index - 1] : null,
    next: index < pages.length - 1 ? pages[index + 1] : null
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug.join('/'));

  if (!page) {
    notFound();
  }

  const [pages, groups] = await Promise.all([getPages(), getPageGroups()]);
  const { prev, next } = findNeighbors(pages, page);
  const rendered = renderPageBody(page.body);

  return (
    <SiteShell groups={groups} currentUrl={page.url} toc>
      <article>
        <PageHead
          section={page.section}
          title={page.title}
          description={page.meta.description}
          body={page.body}
        />
        <div className="rule" />
        <Article html={rendered.html} notes={rendered.notes} />
        <Pagination prev={prev} next={next} />
      </article>
      <ClientScripts />
    </SiteShell>
  );
}
