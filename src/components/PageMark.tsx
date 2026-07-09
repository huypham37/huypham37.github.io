'use client';

interface PageMarkProps {
  active?: boolean;
  onClick?: () => void;
}

export default function PageMark({ active = false, onClick }: PageMarkProps) {
  return (
    <button
      type="button"
      className={`page-mark ${active ? 'is-active' : ''}`}
      onClick={onClick}
      aria-label={active ? 'Close menu' : 'Open menu'}
      aria-expanded={active}
    >
      <svg width="21" height="21" viewBox="0 0 30 30" fill="none" aria-hidden="true">
        <circle cx="15" cy="15" r="14" stroke="currentColor" />
        <line x1="7" y1="11" x2="23" y2="11" stroke="currentColor" />
        <line x1="7" y1="15" x2="23" y2="15" stroke="currentColor" />
        <line x1="7" y1="19" x2="19" y2="19" stroke="currentColor" />
      </svg>
    </button>
  );
}
