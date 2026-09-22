import type { Metadata } from 'next';
import SiteShell from '@/components/SiteShell';
import Footer from '@/components/Footer';
import RecruiterSheet from '@/components/RecruiterSheet';
import { getPageGroups } from '@/lib/content';
import { getRecruiterSheets } from '@/lib/recruiter-data';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: `For recruiters — ${site.name}`,
  description: 'A quick view of what I’ve worked on.'
};

/**
 * A static route, so it wins over the `[...slug]` article catch-all. Both
 * locales are parsed from content/*.yaml at build time; English is what gets
 * exported, and the Dutch swap happens in the browser.
 */
export default async function ForRecruiterPage() {
  const [groups, sheets] = await Promise.all([getPageGroups(), getRecruiterSheets()]);
  const contact = site.footerLinks.find(link => link.href.startsWith('mailto:'))?.href ?? '/';

  return (
    <SiteShell groups={groups} currentUrl="/for-recruiter/">
      <RecruiterSheet sheets={sheets} contact={contact} />
      <Footer index={4} />
    </SiteShell>
  );
}
