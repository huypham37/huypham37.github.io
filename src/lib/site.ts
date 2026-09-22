/**
 * Single source of truth for the shell copy (entrance page, rail, footer).
 * Everything here is editorial content, not layout — edit freely without
 * touching components.
 */

export interface NowEntry {
  label: string;
  text: string;
  href?: string;
}

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

  now: [
    { label: 'Building', text: 'A coding agent for the way I like to work.' },
    { label: 'Running', text: 'Most of my services from a small homelab.' },
    { label: 'Thinking', text: 'Why software keeps becoming harder than it needs to be.' },
    {
      label: 'Writing',
      text: 'The Rise of DIY Software',
      href: '/blog/the-raise-of-personal-software/'
    }
  ] satisfies NowEntry[],

  footerLinks: [
    { label: 'GitHub', href: 'https://github.com/huypham37', external: true },
    { label: 'Email', href: 'mailto:huypham37@gmail.com' }
  ] satisfies FooterLink[]
} as const;
