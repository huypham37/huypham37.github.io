'use client';

import { useState } from 'react';
import PageMark from './PageMark';
import Sidebar from './Sidebar';
import type { Page } from '@/lib/types';

interface PageShellProps {
  groups: Record<string, Page[]>;
  currentUrl?: string;
  children: React.ReactNode;
}

export default function PageShell({ groups, currentUrl, children }: PageShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <PageMark active={menuOpen} onClick={() => setMenuOpen(!menuOpen)} />
      <Sidebar groups={groups} currentUrl={currentUrl} isOpen={menuOpen} />
      <nav className="page-toc" data-page-toc aria-label="On this page" />
      {children}
    </>
  );
}
