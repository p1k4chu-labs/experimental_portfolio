import { supabase } from '../lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface Note {
  id: number;
  title: string;
  content: string;
}

const Home = () => {
  const [user, setUser] = useState<any>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/personal-notes/login');
      } else {
        setUser(session.user);
      }
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id);
    if (error) {
      console.error('Error fetching notes:', error);
    } else {
      setNotes(data as Note[]);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/personal-notes/login');
  };

  const handleCreateNote = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { data, error } = await supabase
      .from('notes')
      .insert([{ ...newNote, user_id: user.id }])
      .select();
    if (error) {
      console.error('Error creating note:', error);
    } else if (data) {
        setNotes([...notes, data[0]]);
        setNewNote({ title: '', content: '' });
    }
  };

  const handleDeleteNote = async (id: number) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) {
      console.error('Error deleting note:', error);
    } else {
      setNotes(notes.filter((note) => note.id !== id));
    }
  };

  if (!user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 shadow-md border-b border-slate-700">
        <div className="max-w-5xl mx-auto py-4 px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">My Notes</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto py-8 px-6">
        <div className="bg-slate-800 p-6 rounded-2xl shadow-2xl mb-8 border border-slate-700">
          <h2 className="text-2xl font-bold mb-4">Create a new note</h2>
          <form onSubmit={handleCreateNote}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-slate-400 text-sm font-bold mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                className="bg-slate-700 border border-slate-600 rounded-lg w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                required
                placeholder="Note title"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="content" className="block text-slate-400 text-sm font-bold mb-2">
                Content
              </label>
              <textarea
                id="content"
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                className="bg-slate-700 border border-slate-600 rounded-lg w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 transition duration-300"
                required
                placeholder="What's on your mind?"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300"
            >
              Create Note
            </button>
          </form>
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-6 border-b-2 border-slate-700 pb-2">Your Notes</h2>
          {notes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => (
                <div key={note.id} className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 flex flex-col justify-between hover:border-blue-500 transition duration-300">
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-blue-400">{note.title}</h3>
                    <p className="text-slate-300 mb-4 whitespace-pre-wrap">{note.content}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="self-start bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md text-sm transition duration-300"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-6 bg-slate-800 rounded-2xl border border-slate-700">
                <p className="text-slate-400">You have no notes yet. Time to create your first one!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
