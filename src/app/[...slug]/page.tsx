import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import Sheet from '@/components/Sheet';
import TitleBlock from '@/components/TitleBlock';
import Article from '@/components/Article';
import Pagination from '@/components/Pagination';
import ClientScripts from '@/components/ClientScripts';
import { getPages, getPageBySlug, getPageGroups, renderPageBody } from '@/lib/content';
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
  const pageSlug = slug.join('/');
  const page = await getPageBySlug(pageSlug);

  if (!page) {
    return { title: 'Not found — reinventthewheel' };
  }

  return {
    title: `${page.title} — reinventthewheel`,
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
  const pageSlug = slug.join('/');
  const page = await getPageBySlug(pageSlug);

  if (!page) {
    notFound();
  }

  const [pages, groups] = await Promise.all([getPages(), getPageGroups()]);
  const { prev, next } = findNeighbors(pages, page);
  const rendered = renderPageBody(page.body);

  return (
    <PageShell groups={groups} currentUrl={page.url}>
      <Sheet>
        <TitleBlock
          title={page.title}
          description={page.meta.description}
          body={rendered.html}
        />
        <Article html={rendered.html} notes={rendered.notes} />
        <Pagination prev={prev} next={next} />
      </Sheet>
      <ClientScripts />
    </PageShell>
  );
}
