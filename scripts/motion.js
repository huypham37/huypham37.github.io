import { animate, inView } from 'motion';

export class PageMotion {
  mount() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // The reading column already reveals itself in CSS (.reveal); the rail is
    // chrome, so it comes in quietly alongside.
    animate('.rail',
      { opacity: [0, 1], x: [-8, 0] },
      { duration: 0.5, delay: 0.1, ease: [0.2, 0.7, 0.2, 1] }
    );

    inView('.sidenote', ({ target }) => {
      animate(target, { opacity: [0, 1], x: [10, 0] }, { duration: 0.5, ease: 'easeOut' });
    });
  }
}
