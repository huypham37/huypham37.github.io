import { readTime } from '@/lib/utils';

interface PageHeadProps {
  section: string;
  title: string;
  description?: string;
  body: string;
}

export default function PageHead({ section, title, description, body }: PageHeadProps) {
  return (
    <header className="page-head">
      <p className="meta">
        {section} · {readTime(body)} min read
      </p>
      <h1>{title}</h1>
      {description && <p className="page-head__sub">{description}</p>}
    </header>
  );
}
