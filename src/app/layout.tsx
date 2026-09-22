import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { site } from '@/lib/site';
import '../../styles/page.css';

export const metadata: Metadata = {
  title: site.name,
  description: 'A quiet index for Random, Blog, Quark, and CS.'
};

/**
 * Resolves the theme before first paint. Without this the document would
 * render light for a frame and then snap to dark.
 *
 * The choice lives on `data-theme`; the palette itself is declared once in
 * base.css via light-dark(), so nothing else has to know the values.
 */
const themeBoot = `try{var s=localStorage.getItem('theme');var d=s?s==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=d?'dark':'light'}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
