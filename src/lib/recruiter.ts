/**
 * Recruiter sheet content, in both locales.
 *
 * Same idea as site.ts: the copy lives here, not in the component, so it can
 * be edited without touching layout. Unlike site.ts it is keyed by locale,
 * because this is the one page that ships in two languages.
 */

export type Locale = 'en' | 'nl';

export const locales: Locale[] = ['en', 'nl'];

export interface SelectedWork {
  name: string;
  detail: string;
}

export interface Role {
  company: string;
  title: string;
  duration: string;
  /** Two-letter plate standing in for a logo, as on a drawing title block. */
  mark: string;
  summary: string;
  highlights: string[];
  selected?: SelectedWork[];
  tech: string[];
}

export interface Project {
  type: string;
  duration: string;
  name: string;
  mark: string;
  summary: string;
  tech: string[];
  /** Omitted when there is nothing public to link to yet. */
  href?: string;
}

export interface Sheet {
  kicker: string;
  heading: string;
  lede: string;
  contactLabel: string;
  toggleLabel: string;
  viewProject: string;
  experience: { label: string; heading: string };
  projects: { label: string; heading: string };
  selectedLabel: string;
  roles: Role[];
  work: Project[];
}

/* Annotated rather than inferred: none of the entries set `href` today, and an
   inferred element type would not carry the optional field. */
const en: Sheet = {
  kicker: 'For recruiters',
  heading: 'A quick view of what I’ve worked on.',
  lede: 'I’m a software engineer focused on building applications and the infrastructure around them — from product code and internal tooling to cloud-native systems, automation, and AI experiments.',
  contactLabel: 'Contact me',
  toggleLabel: 'Language',
  viewProject: 'View project',

  experience: { label: 'Experience', heading: 'Where I’ve worked' },
  projects: { label: 'Selected projects', heading: 'Things I build outside work' },
  selectedLabel: 'Selected work',

  roles: [
    {
      company: 'Philip Morris International',
      title: 'Software Engineer',
      duration: 'Recent role',
      mark: 'PMI',
      summary:
        'Worked on software and infrastructure for internal AI systems, with a focus on reliable deployment, automation, and developer-facing tooling.',
      highlights: [
        'Built and deployed Kubernetes-based infrastructure for an internal LLM system.',
        'Automated infrastructure setup and application delivery using Terraform and Helm.',
        'Worked with observability and monitoring using Prometheus.',
        'Used CI/CD as part of the daily development and deployment workflow.'
      ],
      selected: [
        {
          name: 'Internal LLM Platform',
          detail: 'Infrastructure for running local models and agent workflows for internal use.'
        },
        {
          name: 'Platform Automation',
          detail: 'Repeatable infrastructure and deployment workflows for application environments.'
        }
      ],
      tech: ['Kubernetes', 'Terraform', 'Helm', 'Prometheus', 'CI/CD']
    },
    {
      company: 'Previous experience',
      title: 'Software Developer',
      duration: 'Earlier role',
      mark: 'CO',
      summary:
        'Built application features, internal tooling, and supporting services across software projects with a strong focus on practical delivery.',
      highlights: [
        'Implemented application features end-to-end.',
        'Worked across backend, frontend, deployment, and automation tasks.',
        'Collaborated through Git-based development and CI workflows.'
      ],
      tech: ['TypeScript', 'JavaScript', 'Docker', 'Git']
    }
  ],

  work: [
    {
      type: 'Personal project',
      duration: '2026 — now',
      name: 'Quark — Coding Agent Orchestrator',
      mark: 'Q',
      summary:
        'A native macOS application for orchestrating coding agents, projects, tasks, sessions, and sub-agents. Built around a native Swift interface and a separate agent runtime connected through local IPC.',
      tech: ['Swift', 'Go', 'Unix sockets', 'JSON', 'LLM agents']
    },
    {
      type: 'Infrastructure',
      duration: 'Ongoing',
      name: 'Home Lab',
      mark: 'HL',
      summary:
        'A small self-hosted environment where I run services, experiment with Kubernetes, deployment patterns, networking, observability, and local AI workloads.',
      tech: ['Kubernetes', 'k3s', 'Linux', 'Docker', 'Networking']
    },
    {
      type: 'Software',
      duration: 'Experimental',
      name: 'CHUM',
      mark: 'C',
      summary:
        'A minimal macOS text editor exploring a smaller, more focused editing environment with native-feeling interactions and a deliberately constrained feature set.',
      tech: ['Rust', 'macOS', 'LSP']
    }
  ]
};

const nl: Sheet = {
  kicker: 'Voor recruiters',
  heading: 'Een kort overzicht van waar ik aan heb gewerkt.',
  lede: 'Ik ben software engineer en richt me op het bouwen van applicaties en de infrastructuur eromheen — van productcode en interne tooling tot cloud-native systemen, automatisering en AI-experimenten.',
  contactLabel: 'Neem contact op',
  toggleLabel: 'Taal',
  viewProject: 'Bekijk project',

  experience: { label: 'Ervaring', heading: 'Waar ik heb gewerkt' },
  projects: { label: 'Geselecteerde projecten', heading: 'Dingen die ik buiten werk bouw' },
  selectedLabel: 'Geselecteerd werk',

  roles: [
    {
      company: 'Philip Morris International',
      title: 'Software Engineer',
      duration: 'Recente rol',
      mark: 'PMI',
      summary:
        'Werkte aan software en infrastructuur voor interne AI-systemen, met de nadruk op betrouwbare deployment, automatisering en tooling voor ontwikkelaars.',
      highlights: [
        'Bouwde en deployde Kubernetes-infrastructuur voor een intern LLM-systeem.',
        'Automatiseerde infrastructuur en applicatie-uitrol met Terraform en Helm.',
        'Werkte aan observability en monitoring met Prometheus.',
        'Gebruikte CI/CD als vast onderdeel van de dagelijkse ontwikkel- en deploymentworkflow.'
      ],
      selected: [
        {
          name: 'Intern LLM-platform',
          detail: 'Infrastructuur om lokale modellen en agent-workflows intern te draaien.'
        },
        {
          name: 'Platformautomatisering',
          detail: 'Herhaalbare infrastructuur en deploymentworkflows voor applicatieomgevingen.'
        }
      ],
      tech: ['Kubernetes', 'Terraform', 'Helm', 'Prometheus', 'CI/CD']
    },
    {
      company: 'Eerdere ervaring',
      title: 'Software Developer',
      duration: 'Eerdere rol',
      mark: 'CO',
      summary:
        'Bouwde applicatiefunctionaliteit, interne tooling en ondersteunende services binnen softwareprojecten, met veel aandacht voor praktische oplevering.',
      highlights: [
        'Implementeerde applicatiefunctionaliteit van begin tot eind.',
        'Werkte aan backend, frontend, deployment en automatisering.',
        'Werkte samen via Git-gebaseerde ontwikkeling en CI-workflows.'
      ],
      tech: ['TypeScript', 'JavaScript', 'Docker', 'Git']
    }
  ],

  work: [
    {
      type: 'Persoonlijk project',
      duration: '2026 — nu',
      name: 'Quark — orchestrator voor coding agents',
      mark: 'Q',
      summary:
        'Een native macOS-applicatie voor het orkestreren van coding agents, projecten, taken, sessies en sub-agents. Gebouwd rond een native Swift-interface en een aparte agent-runtime die via lokale IPC is verbonden.',
      tech: ['Swift', 'Go', 'Unix sockets', 'JSON', 'LLM agents']
    },
    {
      type: 'Infrastructuur',
      duration: 'Doorlopend',
      name: 'Homelab',
      mark: 'HL',
      summary:
        'Een kleine self-hosted omgeving waar ik services draai en experimenteer met Kubernetes, deploymentpatronen, netwerken, observability en lokale AI-workloads.',
      tech: ['Kubernetes', 'k3s', 'Linux', 'Docker', 'Networking']
    },
    {
      type: 'Software',
      duration: 'Experimenteel',
      name: 'CHUM',
      mark: 'C',
      summary:
        'Een minimale macOS-teksteditor die een kleinere, gerichtere werkomgeving verkent, met native aanvoelende interacties en een bewust beperkte set functies.',
      tech: ['Rust', 'macOS', 'LSP']
    }
  ]
};

export const recruiter: Record<Locale, Sheet> = { en, nl };
