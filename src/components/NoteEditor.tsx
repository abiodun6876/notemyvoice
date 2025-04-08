import React, { useState, useEffect, useRef } from 'react';
import { Mic, Save, MicOff, X, Tag, Trash2, Calendar } from 'lucide-react';
import type { Note, NoteFormData } from '../types';

interface NoteEditorProps {
  selectedNote: Note | null;
  onSave: (data: NoteFormData) => void;
  onClear: () => void;
}

export function NoteEditor({ selectedNote, onSave, onClear }: NoteEditorProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [formData, setFormData] = useState<NoteFormData>({
    title: '',
    content: '',
    tags: [],
  });
  const [newTag, setNewTag] = useState('');
  const recognition = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (selectedNote) {
      setFormData({
        title: selectedNote.title,
        content: selectedNote.content,
        tags: selectedNote.tags,
      });
    } else {
      const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      setFormData({
        title: `Meeting Notes - ${today}`,
        content: '',
        tags: ['meeting'],
      });
    }
  }, [selectedNote]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognition.current = new webkitSpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;

      recognition.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');
        
        // Clean up the transcript by removing repetitions and formatting properly
        const cleanedTranscript = transcript
          .split('.')
          .map(sentence => sentence.trim())
          .filter((sentence, index, array) => 
            sentence && array.indexOf(sentence) === index
          )
          .join('. ');
        
        setFormData(prev => ({
          ...prev,
          content: cleanedTranscript,
        }));
      };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert('Microphone access was denied. Please enable microphone access in your browser settings to use speech recognition.');
        }
        setIsRecording(false);
      };
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, []);

  const requestMicrophonePermission = async () => {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      
      if (permissionStatus.state === 'denied') {
        alert('Microphone access is blocked. Please enable it in your browser settings to use speech recognition.');
        return false;
      }
      
      if (permissionStatus.state === 'prompt') {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          return true;
        } catch (error) {
          alert('Microphone access was denied. Speech recognition requires microphone access to work.');
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      return false;
    }
  };

  const toggleRecording = async () => {
    if (!recognition.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isRecording) {
      recognition.current.stop();
      setIsRecording(false);
    } else {
      const hasPermission = await requestMicrophonePermission();
      if (hasPermission) {
        try {
          recognition.current.start();
          setIsRecording(true);
        } catch (error) {
          console.error('Error starting speech recognition:', error);
          alert('Failed to start speech recognition. Please try again.');
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please enter both title and content for the note.');
      return;
    }
    onSave(formData);
    handleClear();
  };

  const handleClear = () => {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    setFormData({
      title: `Meeting Notes - ${today}`,
      content: '',
      tags: ['meeting'],
    });
    onClear();
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(newTag.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag.trim()],
        }));
      }
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const formatContent = () => {
    const cleanContent = formData.content
      .split('.')
      .map(sentence => sentence.trim())
      .filter(sentence => sentence)
      .join('. ');
    
    setFormData(prev => ({
      ...prev,
      content: cleanContent + '.',
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 flex items-center gap-2">
          <Calendar size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Meeting Title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="text-xl font-semibold p-2 border-b flex-1 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="ml-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
          title="Clear editor"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {formData.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              <X size={14} />
            </button>
          </span>
        ))}
        <div className="relative inline-flex items-center">
          <Tag size={16} className="absolute left-2 text-gray-400" />
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={addTag}
            placeholder="Add tag..."
            className="pl-8 pr-3 py-1 text-sm border rounded-full focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="relative flex-1">
        <textarea
          placeholder="Start recording or type your meeting notes..."
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          onBlur={formatContent}
          className="w-full h-full p-4 resize-none focus:outline-none"
        />
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t">
        <button
          type="button"
          onClick={toggleRecording}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            isRecording 
              ? 'bg-red-500 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } transition-colors`}
        >
          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Save size={20} />
          {selectedNote ? 'Update Meeting Notes' : 'Save Meeting Notes'}
        </button>
      </div>
    </form>
  );
}