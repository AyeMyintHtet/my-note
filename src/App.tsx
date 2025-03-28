import React, { useEffect, useState } from "react";
import { Plus, LogOut,  Archive } from "lucide-react";

import { supabase } from "./lib/supabase";
import { Auth } from "./components/Auth";
import { NoteList } from "./components/NoteList";
import { NoteEditor } from "./components/NoteEditor";
import { Note } from "./types";
import { LoadingComponent } from "./components/Loading";

function App() {
  const [isLoading,setIsLoading] = useState(true)
  const [session, setSession] = useState(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  useEffect(() => {
    setIsLoading(true)

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      });
    setIsLoading(false)

    

    return () => {
      subscription.unsubscribe();
    }
  }, []);
  useEffect(()=>{
    if (!session?.user?.id) return;
    fetchNotes();

    const channel = supabase.channel(`notes`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notes", filter: `user_id=eq.${session.user.id}` },
        (payload:any) => {
          console.log("Realtime update:", payload);
          setNotes((prevNotes : Note[]) => {
            if (payload.eventType === "INSERT") {
              return [...prevNotes, payload.new]; 
            }
    
            if (payload.eventType === "UPDATE") {
              return prevNotes.map((note) =>
                note.id === payload.new.id ? payload.new : note
              ); // Update the existing note
            }
            return prevNotes;
          });
        }
      )
      
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // Cleanup subscription on unmount
    };

  },[session])

  async function fetchNotes() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      // .eq("is_archived", showArchived)
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false });
    if (error) {
      console.error("Error fetching notes:", error);
    } else {
      setNotes(data || []);
    }
    setIsLoading(false)
  }

  async function handleSaveNote(noteData: Partial<Note>) {
    setIsLoading(true)

    if (selectedNote) {
      const { error } = await supabase
        .from("notes")
        .update(noteData)
        .eq("id", selectedNote.id);

      if (!error) {
        fetchNotes();
        setSelectedNote(null);
        setShowEditor(false);
      }
    } else {
      const { error } = await supabase.from("notes").insert([
        {
          ...noteData,
          user_id: session?.user?.id,
        },
      ]);

      if (!error) {
        fetchNotes();
        setShowEditor(false);
      }
    }
    setIsLoading(false)
  }

  async function handlePinNote(id: string) {
    setIsLoading(true)

    const note = notes.find((n) => n.id === id);
    if (note) {
      const { error } = await supabase
        .from("notes")
        .update({ is_pinned: !note.is_pinned })
        .eq("id", id);

      if (!error) {
        fetchNotes();
      }
    }
    setIsLoading(false)
  }

  async function handleArchiveNote(id: string) {
    setIsLoading(true)

    const note = notes.find((n) => n.id === id);
    if (note) {
      const status = !note.is_archived;
      const { error } = await supabase
        .from("notes")
        .update({ is_archived: status })
        .eq("id", id);
      if (!error) {
        fetchNotes();
      }
    }
    setIsLoading(false)
  }

  async function handleDeleteNote(id: string) {
    setIsLoading(true)

    const { error } = await supabase.from("notes").update({ is_deleted: true }).eq("id", id);

    if (!error) {
      fetchNotes();
    }
    setIsLoading(false)
  }

  if(isLoading){
    return <LoadingComponent />
  }
  if (!session && !isLoading) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setSelectedNote(null);
                setShowEditor(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </header>
      <div>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-end w-full pr-4 ">
            <button
              onClick={() => {
                setShowArchived((prev) => !prev);
              }}
              className="relative inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Archive className="h-4 w-4 mr-2" />
              Show {!showArchived ? "Archived" : "Notes"} 

            </button>
          </div>
          <NoteList
            notes={notes.filter((item:Note)=> item.is_archived === showArchived && item.is_deleted === false)}
            onPinNote={handlePinNote}
            onArchiveNote={handleArchiveNote}
            onDeleteNote={handleDeleteNote}
            onSelectNote={(note) => {
              setSelectedNote(note);
              setShowEditor(true);
            }}
          />
        </main>

        {showEditor && (
          <NoteEditor
            note={selectedNote}
            onSave={handleSaveNote}
            onClose={() => {
              setSelectedNote(null);
              setShowEditor(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
export default App;
