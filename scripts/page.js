import { PageToc } from './toc.js';
import { Lightbox } from './lightbox.js';

new PageToc().mount();
new Lightbox().mount();

import('./motion.js')
  .then(({ PageMotion }) => new PageMotion().mount())
  .catch(() => {});
