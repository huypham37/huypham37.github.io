'use client';

import { useEffect, useState } from 'react';
import { locales, type Locale, type Sheet } from '@/lib/recruiter';
import { reveal } from '@/lib/reveal';

interface RecruiterSheetProps {
  /** Both locales of the sheet, parsed from content/*.yaml on the server. */
  sheets: Record<Locale, Sheet>;
  /** mailto: target for the contact affordance, resolved on the server. */
  contact: string;
}

/**
 * The sheet is the one part of the site that ships in two languages, so it is
 * the one client component. It receives both locales as props rather than
 * importing them, because the loader reads from disk and could never run in a
 * browser. `en` is the default on the server too, so the exported HTML carries
 * real content and crawlers see English.
 */
export default function RecruiterSheet({ sheets, contact }: RecruiterSheetProps) {
  const [locale, setLocale] = useState<Locale>('en');
  const copy = sheets[locale];

  // Keep the document language honest for screen readers and hyphenation.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <>
      <header className="page-head reveal" style={reveal(0)}>
        <p className="meta">{copy.kicker}</p>
        <h1>{copy.heading}</h1>
        <p className="page-head__sub">{copy.lede}</p>
      </header>

      <div className="rec-actions reveal" style={reveal(1)}>
        <a className="rec-button" href={contact}>
          {copy.contactLabel}
        </a>

        <div className="rec-lang" role="group" aria-label={copy.toggleLabel}>
          <span className="rec-lang__label">{copy.toggleLabel}</span>
          {locales.map(code => (
            <button
              key={code}
              type="button"
              className="rec-lang__option"
              aria-pressed={locale === code}
              onClick={() => setLocale(code)}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      <div className="rule" />

      <section className="rec-group reveal" style={reveal(2)}>
        <div className="section-head">
          <h2>{copy.experience.label}</h2>
          <span>{copy.experience.heading}</span>
        </div>

        {copy.roles.map(role => (
          <article className="rec-role" key={role.mark}>
            <div className="rec-role__head">
              <div>
                <p className="rec-company">{role.company}</p>
                <h3 className="rec-title">{role.title}</h3>
                <p className="rec-duration">{role.duration}</p>
              </div>
              {/* Decorative: the company name is the text right beside it. */}
              <span
                className={role.logo ? 'rec-mark rec-mark--logo' : 'rec-mark'}
                aria-hidden="true"
              >
                {role.logo ? <img src={role.logo} alt="" /> : role.mark}
              </span>
            </div>

            <p className="rec-summary">{role.summary}</p>

            <ul className="rec-highlights">
              {role.highlights.map(highlight => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>

            {role.selected && (
              <div className="rec-selected">
                <p className="rec-label">{copy.selectedLabel}</p>
                {role.selected.map(item => (
                  <div className="rec-selected__row" key={item.name}>
                    <strong>{item.name}</strong>
                    <span>{item.detail}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="rec-tech">
              {role.tech.map(tech => (
                <span className="rec-chip" key={tech}>{tech}</span>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="rec-group reveal" style={reveal(3)}>
        <div className="section-head">
          <h2>{copy.projects.label}</h2>
          <span>{copy.projects.heading}</span>
        </div>

        {copy.work.map(project => (
          <article className="rec-project" key={project.mark}>
            <div className="rec-project__meta">
              <p className="rec-project__type">{project.type}</p>
              <p className="rec-duration">{project.duration}</p>
            </div>

            <div className="rec-project__body">
              <h3 className="rec-title">{project.name}</h3>
              <p className="rec-summary">{project.summary}</p>
              {project.href && (
                <a className="rec-project__link" href={project.href}>{copy.viewProject}</a>
              )}
            </div>

            <span className="rec-mark" aria-hidden="true">{project.mark}</span>

            <div className="rec-tech">
              {project.tech.map(tech => (
                <span className="rec-chip" key={tech}>{tech}</span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
