import React from "react";
import { Pin, Archive, Trash2  } from "lucide-react";
import { Note } from "../types";
import { ToolTip } from "./Tooltips";

interface NoteListProps {
  notes: Note[];
  onPinNote: (id: string) => void;
  onArchiveNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onSelectNote: (note: Note) => void;
}

export function NoteList({
  notes,
  onPinNote,
  onArchiveNote,
  onDeleteNote,
  onSelectNote,
}: NoteListProps) {
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {sortedNotes.map((note) => (
        <div
          key={note.id}
          className={`relative p-4 rounded-lg cursor-pointer shadow-md hover:shadow-lg transition-shadow ${
            note.is_pinned ? "bg-yellow-50" : note.is_archived ? "bg-blue-50": ``
          }`}
          style={{ backgroundColor: (!note.is_pinned && !note.is_archived) ? `white` : '' }}
          onClick={() => onSelectNote(note)}
        >
          <div className="flex justify-between items-start mb-2">
            <h3
              className="text-lg font-medium truncate text-gray-900 cursor-pointer"
            >
              {note.title || "Untitled"}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={(e) => {e.stopPropagation();onPinNote(note.id)}}
                className={` relative group p-1 rounded-full hover:bg-gray-100 ${
                  note.is_pinned ? "text-yellow-600" : "text-gray-400"
                }`}
              >
                <Pin className="h-4 w-4" />
                <ToolTip title={note.is_pinned ? "Unarchive" : "Archive" }/>
              </button>
              <button
                onClick={(e) => {e.stopPropagation();onArchiveNote(note.id)}}
                className={`relative group p-1 rounded-full hover:bg-gray-100 ${
                  note.is_archived ? "text-indigo-600" : "text-gray-400"
                }`}
              >
                <Archive className="h-4 w-4" />
                <ToolTip title={note.is_archived ? "Unarchive" : "Archive" }/>
                
              </button>
              <button
                onClick={(e) => {e.stopPropagation();onDeleteNote(note.id)}}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="text-gray-600 line-clamp-3">{note.content}</p>
          <div className="mt-2 text-xs text-gray-400">
            Last updated: {new Date(note.updated_at).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}
