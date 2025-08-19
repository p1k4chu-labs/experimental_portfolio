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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto py-4 px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Personal Notes</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto py-8 px-6">
        <form onSubmit={handleCreateNote} className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4">Create a new note</h2>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">
              Content
            </label>
            <textarea
              id="content"
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Create Note
          </button>
        </form>
        <div>
          <h2 className="text-xl font-bold mb-4">Your Notes</h2>
          {notes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => (
                <div key={note.id} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-bold mb-2">{note.title}</h3>
                  <p className="text-gray-700 mb-4">{note.content}</p>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>You have no notes yet.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
