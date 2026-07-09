import Notes from './Notes';
import type { Note } from '@/lib/types';

interface ArticleProps {
  html: string;
  notes: Note[];
}

export default function Article({ html, notes }: ArticleProps) {
  return (
    <div className="article">
      <div className="body" dangerouslySetInnerHTML={{ __html: html }} />
      <Notes notes={notes} />
    </div>
  );
}
