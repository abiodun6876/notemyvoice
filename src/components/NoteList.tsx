import React, { useState } from 'react';
import { Mic, Star, Trash2, Search, Download, SortAsc } from 'lucide-react';
import type { Note, SortOption } from '../types';

interface NoteListProps {
  notes: Note[];
  onDeleteNote: (id: string) => void;
  onSelectNote: (note: Note) => void;
  onToggleFavorite: (id: string) => void;
}

export function NoteList({ notes, onDeleteNote, onSelectNote, onToggleFavorite }: NoteListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(notes.flatMap(note => note.tags))).sort();

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTag = !selectedTag || note.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'favorite':
        return (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0);
      case 'date':
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  const exportNote = (note: Note) => {
    // Create markdown content
    const markdown = `# ${note.title}\n\n${note.content}\n\n## Tags\n${note.tags.map(tag => `- ${tag}`).join('\n')}\n\nCreated: ${new Date(note.createdAt).toLocaleString()}\nLast Updated: ${new Date(note.updatedAt).toLocaleString()}`;
    
    // Create blob and download
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAllNotes = () => {
    // Create a zip of all notes
    const markdown = sortedNotes.map(note => (
      `# ${note.title}\n\n${note.content}\n\n## Tags\n${note.tags.map(tag => `- ${tag}`).join('\n')}\n\nCreated: ${new Date(note.createdAt).toLocaleString()}\nLast Updated: ${new Date(note.updatedAt).toLocaleString()}\n\n---\n\n`
    )).join('\n');

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting_notes_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full md:w-80 bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">My Notes</h2>
          <button
            onClick={exportAllNotes}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="Export all notes"
          >
            <Download size={20} />
          </button>
        </div>
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 mb-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="favorite">Sort by Favorite</option>
          </select>
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2 py-1 text-sm rounded-full ${
                  selectedTag === tag
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="divide-y max-h-[calc(100vh-300px)] overflow-y-auto">
        {sortedNotes.map((note) => (
          <div
            key={note.id}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 
                className="font-medium text-gray-800 truncate hover:text-blue-600"
                onClick={() => onSelectNote(note)}
              >
                {note.title}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportNote(note)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Export note"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={() => onToggleFavorite(note.id)}
                  className={`${note.favorite ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-600 transition-colors`}
                >
                  <Star size={16} fill={note.favorite ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
            <p 
              className="text-sm text-gray-500 mt-1 truncate"
              onClick={() => onSelectNote(note)}
            >
              {note.content}
            </p>
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {note.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">
                {new Date(note.updatedAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => onDeleteNote(note.id)}
                className="text-red-500 hover:text-red-600 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {sortedNotes.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No notes found
          </div>
        )}
      </div>
    </div>
  );
}