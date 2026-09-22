import type { ReactNode } from 'react';
import Rail from './Rail';
import type { Page } from '@/lib/types';

interface SiteShellProps {
  groups: Record<string, Page[]>;
  currentUrl?: string;
  /** Article pages get a third column holding the on-page contents. */
  toc?: boolean;
  children: ReactNode;
}

export default function SiteShell({ groups, currentUrl, toc = false, children }: SiteShellProps) {
  return (
    <div className={toc ? 'shell shell--toc' : 'shell'}>
      <Rail groups={groups} currentUrl={currentUrl} />
      <main>{children}</main>
      {toc && <nav className="page-toc" data-page-toc aria-label="On this page" />}
    </div>
  );
}
