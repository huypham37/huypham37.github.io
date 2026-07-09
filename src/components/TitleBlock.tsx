import { wordCount } from '@/lib/utils';

interface TitleBlockProps {
  title: string;
  description?: string;
  body?: string;
}

export default function TitleBlock({ title, description, body = '' }: TitleBlockProps) {
  return (
    <section className="title-block">
      <div className="meta">{wordCount(body)} words</div>
      <h1>{title}</h1>
      {description && <div className="sub">{description}</div>}
      <div className="rule" aria-hidden="true">
        —————
      </div>
    </section>
  );
}
