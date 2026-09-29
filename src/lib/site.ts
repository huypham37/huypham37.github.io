/**
 * Single source of truth for the shell copy (entrance page, rail, footer).
 * Everything here is editorial content, not layout — edit freely without
 * touching components.
 */

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export const site = {
  name: 'reinventthewheel',
  logoAlt: 'HP monogram',

  eyebrow: 'Software developer · builder · writer',
  greeting: 'Hello.',

  footerLinks: [
    { label: 'GitHub', href: 'https://github.com/huypham37', external: true },
    { label: 'Email', href: 'mailto:huypham37@gmail.com' }
  ] satisfies FooterLink[]
} as const;
