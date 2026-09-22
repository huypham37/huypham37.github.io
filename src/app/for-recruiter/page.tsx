import type { Metadata } from 'next';
import SiteShell from '@/components/SiteShell';
import Footer from '@/components/Footer';
import { getPageGroups } from '@/lib/content';
import { site } from '@/lib/site';
import { recruiter } from '@/lib/recruiter';
import { reveal } from '@/lib/reveal';

export const metadata: Metadata = {
  title: `For recruiters — ${site.name}`,
  description: recruiter.lede
};

/**
 * A static route, so it wins over the `[...slug]` article catch-all. The sheet
 * is a server component; the only interactive part of the page is the rail.
 */
export default async function ForRecruiterPage() {
  const groups = await getPageGroups();
  const contact = site.footerLinks.find(link => link.href.startsWith('mailto:'))?.href ?? '/';

  return (
    <SiteShell groups={groups} currentUrl="/for-recruiter/">
      <header className="page-head reveal" style={reveal(0)}>
        <p className="meta">{recruiter.kicker}</p>
        <h1>{recruiter.heading}</h1>
        <p className="page-head__sub">{recruiter.lede}</p>
      </header>

      <div className="rec-actions reveal" style={reveal(1)}>
        <a className="rec-button" href={contact}>
          {recruiter.contactLabel}
        </a>
      </div>

      <div className="rule" />

      <section className="rec-group reveal" style={reveal(2)}>
        <div className="section-head">
          <h2>{recruiter.experience.label}</h2>
          <span>{recruiter.experience.heading}</span>
        </div>

        {recruiter.roles.map(role => (
          <article className="rec-role" key={role.company}>
            <div className="rec-role__head">
              <div>
                <p className="rec-company">{role.company}</p>
                <h3 className="rec-title">{role.title}</h3>
                <p className="rec-duration">{role.duration}</p>
              </div>
              <span className="rec-mark" aria-hidden="true">{role.mark}</span>
            </div>

            <p className="rec-summary">{role.summary}</p>

            <ul className="rec-highlights">
              {role.highlights.map(highlight => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>

            {role.selected && (
              <div className="rec-selected">
                <p className="rec-label">{recruiter.selectedLabel}</p>
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
          <h2>{recruiter.projects.label}</h2>
          <span>{recruiter.projects.heading}</span>
        </div>

        {recruiter.work.map(project => (
          <article className="rec-project" key={project.name}>
            <div className="rec-project__meta">
              <p className="rec-project__type">{project.type}</p>
              <p className="rec-duration">{project.duration}</p>
            </div>

            <div className="rec-project__body">
              <h3 className="rec-title">{project.name}</h3>
              <p className="rec-summary">{project.summary}</p>
              {project.href && (
                <a className="rec-project__link" href={project.href}>View project</a>
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

      <Footer index={4} />
    </SiteShell>
  );
}
