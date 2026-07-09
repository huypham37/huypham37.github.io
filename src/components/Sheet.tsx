import type { ReactNode } from 'react';

interface SheetProps {
  children: ReactNode;
}

export default function Sheet({ children }: SheetProps) {
  return (
    <main className="sheet">
      {children}
    </main>
  );
}
