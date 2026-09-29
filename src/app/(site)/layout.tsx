import '../../../styles/page.css';

/**
 * The site's layout: the stylesheet, and nothing else that every page needs.
 *
 * A route group, so a page that brings its own CSS — as the CV did while it
 * lived here — does not load the site's stylesheets. Route groups do not
 * appear in URLs, so every path below is unchanged.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
