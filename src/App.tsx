import React, { useEffect, useState } from "react";
import { Plus, LogOut, Palette, Archive } from "lucide-react";
import { HuePicker, AlphaPicker } from "react-color";
import { useDebounce } from "react-haiku";

import { supabase } from "./lib/supabase";
import { Auth } from "./components/Auth";
import { NoteList } from "./components/NoteList";
import { NoteEditor } from "./components/NoteEditor";
import { Note } from "./types";
import { setCookiesData } from "./utils/setCookieData";
import { getCookiesData } from "./utils/getCookiesData";
import { LoadingComponent } from "./components/Loading";

function App() {
  const [isLoading,setIsLoading] = useState(true)
  const [session, setSession] = useState(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [color, setColor] = useState({ r: 255, g: 255, b: 255, a: 1 });
  useEffect(() => {
    setIsLoading(true)
    const setColorFromSessions = (access_token:string) =>{
      const data = getCookiesData(`${access_token}noteColor`)
      console.log(JSON.parse(data),'data')
      setColor(data ? JSON.parse(data):{ r: 255, g: 255, b: 255, a: 1 } )
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCookiesData('access_token', session.access_token);
      setColorFromSessions(session.access_token);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setCookiesData('access_token', session.access_token);
      setColorFromSessions(session.access_token);

      });
    setIsLoading(false)
      

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchNotes();
    }
  }, [session, showArchived]);
  const saveToCookies = ()=>{
    session?.access_token && setCookiesData(`${session.access_token}noteColor`, JSON.stringify(color))
  }

  const handleColorChange = (newColor: any) => {
    setColor((prev) => ({
      ...prev,
      r: newColor.rgb.r,
      g: newColor.rgb.g,
      b: newColor.rgb.b,
    }));
    saveToCookies()
  };
  const handleAlphaChange = (newAlpha) => {
    setColor((prev) => ({
      ...prev,
      a: newAlpha.rgb.a,
    }));
    saveToCookies()
  };


  async function fetchNotes() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("is_archived", showArchived)
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

    const { error } = await supabase.from("notes").delete().eq("id", id);

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
            <div className="relative group">
              <div className="inline-flex cursor-pointer items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <Palette className="h-4 w-4" />
              </div>

              <div className="!absolute z-10 rounded-md top-full left-1/2 transform -translate-x-1/2 shadow-md hover:shadow-lg  bg-gray-50 p-0  group-hover:p-5 h-0 group-hover:h-fit overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <h3 className="text-lg font-medium truncate text-gray-900 cursor-pointer">
                  Card Color
                </h3>
                <HuePicker
                  className=""
                  color={color}
                  onChange={handleColorChange}
                />
                <br />
                <AlphaPicker color={color} onChange={handleAlphaChange} />
              </div>
            </div>
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
            notes={notes}
            onPinNote={handlePinNote}
            onArchiveNote={handleArchiveNote}
            onDeleteNote={handleDeleteNote}
            color={ `${ color?.r + ','  + color?.g+ ','  + color?.b+ ','  + color?.a}`}
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
