import type { Note } from '@/lib/types';

interface NotesProps {
  notes: Note[];
}

export default function Notes({ notes }: NotesProps) {
  if (!notes.length) return null;

  return (
    <aside className="sidenotes">
      {notes.map(note => (
        <div className="sidenote" key={note.num}>
          <span className="num">{note.num}</span>
          <span dangerouslySetInnerHTML={{ __html: note.html }} />
        </div>
      ))}
    </aside>
  );
}
