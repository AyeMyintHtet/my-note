import React, { useState, useEffect } from 'react';
import { useKeyPress } from 'react-haiku';
import { Save, X } from 'lucide-react';
import { Note } from '../types';

interface NoteEditorProps {
  note: Note | null;
  onSave: (note: Partial<Note>) => void;
  onClose: () => void;
}

export function NoteEditor({ note, onSave, onClose }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');

  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
  }, [note]);
  
  useKeyPress(['Enter'], ()=>{
    handleSave();
  })

  const handleSave = () => {
    if(content.length ===0) return;
    onSave({
      title,
      content,
      updated_at: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-4 border-b flex justify-between items-center">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="text-xl font-semibold focus:outline-none w-full"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className={`p-2 rounded-full hover:bg-gray-100  ${content.length === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-green-600'}`}
            >
              <Save className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          className="w-full p-4 h-96 focus:outline-none resize-none"
        />
      </div>
    </div>
  );
}