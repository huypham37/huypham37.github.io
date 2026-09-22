import { site } from '@/lib/site';
import { reveal } from '@/lib/reveal';

interface FooterProps {
  /** Stagger index, so the footer lands after the page's own sections. */
  index: number;
}

export default function Footer({ index }: FooterProps) {
  return (
    <footer className="foot reveal" style={reveal(index)}>
      <span className="foot__brand">
        <span className="foot__mark" role="img" aria-label={site.logoAlt} />
        <span>© {new Date().getFullYear()} {site.name}</span>
      </span>

      <span className="foot__links">
        {site.footerLinks.map(link => (
          <a
            key={link.label}
            href={link.href}
            {...('external' in link && link.external
              ? { target: '_blank', rel: 'noreferrer' }
              : {})}
          >
            {link.label}
          </a>
        ))}
      </span>
    </footer>
  );
}
