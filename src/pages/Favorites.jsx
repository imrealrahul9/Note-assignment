import { useState, useEffect } from "react";
import { useNotes } from "../context/NotesContext";
import NoteCard from "../components/NoteCard";
import NoteModal from "../components/NoteModal";
import axios from "axios";

export default function Favorites() {
  const { notes, fetchNotes, toggleFavorite, setNotes } = useNotes();
  const [favoriteNotes, setFavoriteNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null); 

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    setFavoriteNotes(notes.filter((note) => note.isFavorite)); 
  }, [notes]);

  const handleSave = async (updatedNote) => {
    try {
      const token = localStorage.getItem("token");
  
      const res = await axios.put(
        `https://note-assignment-v8bm.onrender.com/notes/${updatedNote._id}`,
        updatedNote,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const savedNote = res.data; 
  
      setNotes((prevNotes) =>
        prevNotes.map((n) => (n._id === savedNote._id ? savedNote : n))
      );
  
      setFavoriteNotes((prevFavorites) =>
        prevFavorites.map((n) => (n._id === savedNote._id ? savedNote : n))
      );
  
      setSelectedNote(null);
    } catch (err) {
      console.error("Error updating note:", err);
    }
  };
  

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Favorite Notes</h2>

      {favoriteNotes.length === 0 ? (
        <p className="text-gray-500">No favorite notes yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteNotes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onSelect={() => setSelectedNote(note)} 
              onToggleFavorite={() => toggleFavorite(note._id, note.isFavorite)}
            />
          ))}
        </div>
      )}

      {selectedNote && (
        <NoteModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)} 
          onSave={handleSave} 
          onToggleFavorite={() => toggleFavorite(selectedNote._id, selectedNote.isFavorite)}
        />
      )}
    </div>
  );
}
