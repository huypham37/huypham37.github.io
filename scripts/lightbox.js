/* ─── image focus view ───────────────────────────────────
   Click an article image to open a frosted-blue focus
   overlay showing the plate enlarged with its figure title.
   Close with EXIT, the backdrop, or Escape. */

export class Lightbox {
  mount() {
    const images = Array.from(document.querySelectorAll('.article .body img'));
    if (!images.length) return;

    this.build();

    images.forEach((img, index) => {
      img.dataset.fig = String(index + 1);
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', `Open figure ${index + 1}`);
      img.addEventListener('click', () => this.open(img));
      img.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.open(img);
        }
      });
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && this.isOpen) this.close();
    });
  }

  build() {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <button type="button" class="lightbox__exit" aria-label="Close figure">exit</button>
      <figure class="lightbox__stage">
        <img class="lightbox__img" alt="" />
        <figcaption class="lightbox__caption"></figcaption>
      </figure>`;

    overlay.addEventListener('click', event => {
      if (event.target === overlay || event.target.closest('.lightbox__exit')) {
        this.close();
      }
    });

    document.body.appendChild(overlay);
    this.overlay = overlay;
    this.img = overlay.querySelector('.lightbox__img');
    this.caption = overlay.querySelector('.lightbox__caption');
  }

  open(source) {
    const title = source.getAttribute('alt') || '';
    this.img.src = source.currentSrc || source.src;
    this.img.alt = title;
    this.caption.innerHTML = `<span class="lightbox__fig">fig. ${source.dataset.fig} ·</span> <span class="lightbox__title">${title}</span>`;
    this.caption.hidden = !title;

    this.overlay.classList.add('is-open');
    this.overlay.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('lightbox-lock');
    this.isOpen = true;
  }

  close() {
    this.overlay.classList.remove('is-open');
    this.overlay.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('lightbox-lock');
    this.isOpen = false;
  }
}
