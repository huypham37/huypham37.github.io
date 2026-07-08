// On-page table of contents (right edge), with scroll-spy.
// Builds itself from the article's headings; the heading closest to the top
// of the viewport becomes "active" (full black); the rest fade to 30%.
export class PageToc {
  constructor(root = document) {
    this.host = root.querySelector('[data-page-toc]');
    this.scope = root.querySelector('.article .body');
    this.headings = [];
    this.links = [];
    this.activeId = '';
    this.raf = 0;
    this.baseOffsets = []; // cached document-top offsets — only recomputed on resize
  }

  mount() {
    if (!this.host || !this.scope) return;
    this.headings = [...this.scope.querySelectorAll('h2[id], h3[id]')];
    if (this.headings.length < 2) return; // nothing worth indexing

    this.build();
    this._rebase();
    window.addEventListener('scroll', this.requestUpdate, { passive: true });
    window.addEventListener('resize', this.requestRebase);
    this.update();
  }

  _rebase() {
    const scrollY = window.scrollY;
    this.baseOffsets = this.headings.map(
      h => h.getBoundingClientRect().top + scrollY
    );
  }

  requestRebase = () => {
    this._rebase();
    this.requestUpdate();
  };

  build() {
    const list = document.createElement('ul');
    for (const h of this.headings) {
      const li = document.createElement('li');
      li.className = `page-toc__item page-toc__item--${h.tagName.toLowerCase()}`;

      const a = document.createElement('a');
      a.href = `#${h.id}`;
      a.textContent = h.textContent.replace(/^§\s*/, '').trim();
      a.dataset.tocLink = h.id;

      li.appendChild(a);
      list.appendChild(li);
      this.links.push(a);
    }
    this.host.replaceChildren(list);
  }

  requestUpdate = () => {
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(this.update);
  };

  update = () => {
    const offset = 140; // a heading counts as "current" once it passes this line
    const step = 48;    // scroll reserved for each heading squeezed at the bottom
    const scrollY = window.scrollY;
    const maxScroll = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      0
    );

    // Thresholds built from cached offsets (no getBoundingClientRect per scroll).
    const thresholds = this.baseOffsets.map(p => p - offset);
    // Headings in the final, un-scrollable stretch can never reach the line on
    // their own, so compress the tail: each gets a small slice of scroll just
    // before the end, last one snapping exactly to the bottom.
    for (let i = thresholds.length - 1; i >= 0; i--) {
      const cap = maxScroll - step * (thresholds.length - 1 - i);
      if (thresholds[i] > cap) thresholds[i] = cap;
    }

    let index = 0;
    for (let i = 0; i < thresholds.length; i++) {
      if (scrollY >= thresholds[i] - 1) index = i;
    }
    const current = this.headings[index];

    if (current.id === this.activeId) return;
    this.activeId = current.id;
    for (const a of this.links) {
      a.classList.toggle('is-active', a.dataset.tocLink === current.id);
    }
  };
}
