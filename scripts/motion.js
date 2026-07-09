import { animate, inView } from 'motion';

export class PageMotion {
  mount() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    animate('.sheet',
      { opacity: [0, 1], y: [12, 0] },
      { duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }
    );
    animate('.writing-sidebar',
      { opacity: [0, 1], x: [-8, 0] },
      { duration: 0.5, delay: 0.25, ease: [0.2, 0.7, 0.2, 1] }
    );

    inView('.sidenote', ({ target }) => {
      animate(target, { opacity: [0, 1], x: [10, 0] }, { duration: 0.5, ease: 'easeOut' });
    });
  }
}
