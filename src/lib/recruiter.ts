/**
 * Recruiter sheet content.
 *
 * Same idea as site.ts: the copy lives here, not in the component, so it can
 * be edited without touching layout.
 */

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

/* Annotated rather than inferred: none of the entries set `href` today, and an
   inferred element type would not carry the optional field. */
const roles: Role[] = [
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
];

const work: Project[] = [
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
];

export const recruiter = {
  kicker: 'For recruiters',
  heading: 'A quick view of what I’ve worked on.',
  lede: 'I’m a software engineer focused on building applications and the infrastructure around them — from product code and internal tooling to cloud-native systems, automation, and AI experiments.',
  contactLabel: 'Contact me',

  experience: {
    label: 'Experience',
    heading: 'Where I’ve worked'
  },
  projects: {
    label: 'Selected projects',
    heading: 'Things I build outside work'
  },
  selectedLabel: 'Selected work',

  roles,
  work
};
