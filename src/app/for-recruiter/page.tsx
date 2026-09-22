import type { Metadata } from 'next';
import SiteShell from '@/components/SiteShell';
import Footer from '@/components/Footer';
import RecruiterSheet from '@/components/RecruiterSheet';
import { getPageGroups } from '@/lib/content';
import { site } from '@/lib/site';
import { recruiter } from '@/lib/recruiter';

export const metadata: Metadata = {
  title: `For recruiters — ${site.name}`,
  description: recruiter.en.lede
};

/**
 * A static route, so it wins over the `[...slug]` article catch-all. English
 * is what gets exported; the Dutch toggle is a client-side swap.
 */
export default async function ForRecruiterPage() {
  const groups = await getPageGroups();
  const contact = site.footerLinks.find(link => link.href.startsWith('mailto:'))?.href ?? '/';

  return (
    <SiteShell groups={groups} currentUrl="/for-recruiter/">
      <RecruiterSheet contact={contact} />
      <Footer index={4} />
    </SiteShell>
  );
}
