'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

/**
 * The visual state of the switch is driven purely by `:root[data-theme]` in
 * CSS, so it is already correct on first paint. This component only owns the
 * interaction and persistence — hence the effect, which syncs the accessible
 * state after hydration instead of guessing during SSR.
 */
export default function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;

    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode / storage disabled — the toggle still works for this page */
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={theme === 'dark'}
      className="theme-switch"
      onClick={toggle}
    >
      <span className="theme-switch__track" aria-hidden="true">
        <span className="theme-switch__thumb" />
      </span>
      <span className="theme-switch__label">Dark appearance</span>
    </button>
  );
}
