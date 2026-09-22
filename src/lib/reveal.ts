import type { CSSProperties } from 'react';

/**
 * Stagger index for the `.reveal` entrance animation.
 *
 *   <section className="reveal" style={reveal(2)}>
 *
 * The animation reads `--i` and delays itself, which keeps the order explicit
 * at the call site instead of depending on DOM position (`:nth-child`).
 */
export function reveal(index: number): CSSProperties {
  return { '--i': index } as CSSProperties;
}
