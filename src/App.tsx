import { useState, useEffect } from 'react';
import { BookMarked } from 'lucide-react';
import { NoteList } from './components/NoteList';
import { NoteEditor } from './components/NoteEditor';
import type { Note, NoteFormData } from './types';

function App() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem('notes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const handleSaveNote = (data: NoteFormData) => {
    if (selectedNote) {
      setNotes(notes.map(note =>
        note.id === selectedNote.id
          ? {
              ...note,
              ...data,
              updatedAt: new Date(),
            }
          : note
      ));
      setSelectedNote(null);
    } else {
      const newNote: Note = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        favorite: false,
        tags: ['meeting', ...(data.tags || [])],
      };
      setNotes([newNote, ...notes]);
    }
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(note => note.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
    }
  };

  const handleToggleFavorite = (id: string) => {
    setNotes(notes.map(note =>
      note.id === id
        ? { ...note, favorite: !note.favorite }
        : note
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2">
            <BookMarked className="text-blue-500" size={24} />
            <h1 className="text-xl font-semibold text-gray-800">MeetingNote</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <NoteList
            notes={notes}
            onDeleteNote={handleDeleteNote}
            onSelectNote={setSelectedNote}
            onToggleFavorite={handleToggleFavorite}
          />
          <NoteEditor
            selectedNote={selectedNote}
            onSave={handleSaveNote}
            onClear={() => setSelectedNote(null)}
          />
        </div>
      </main>
    </div>
  );
}

export default App;