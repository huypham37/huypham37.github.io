import Link from 'next/link';
import type { Page } from '@/lib/types';

interface PaginationProps {
  prev?: Page | null;
  next?: Page | null;
}

export default function Pagination({ prev, next }: PaginationProps) {
  return (
    <nav className="pagination">
      <Link className="left" href={prev ? prev.url : '/'}>
        {prev ? `prev · ${prev.title}` : 'index'}
      </Link>
      <Link className="center" href="/">
        index
      </Link>
      <Link className="right" href={next ? next.url : '/'}>
        {next ? `next · ${next.title}` : 'index'}
      </Link>
    </nav>
  );
}
