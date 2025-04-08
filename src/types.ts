export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  favorite: boolean;
  tags: string[];
}

export interface NoteFormData {
  title: string;
  content: string;
  tags: string[];
}

export type SortOption = 'date' | 'title' | 'favorite';