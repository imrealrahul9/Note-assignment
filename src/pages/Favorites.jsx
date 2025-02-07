import { useState, useEffect } from "react";
import { useNotes } from "../context/NotesContext";
import NoteCard from "../components/NoteCard";
import NoteModal from "../components/NoteModal";
import axios from "axios";

export default function Favorites() {
  const { notes, fetchNotes, toggleFavorite, setNotes } = useNotes();
  const [favoriteNotes, setFavoriteNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null); // Track the selected note for editing

  // Fetch the notes when the Favorites page loads
  useEffect(() => {
    fetchNotes(); // Re-fetch notes whenever the page loads
  }, []);

  // Filter favorite notes whenever `notes` state changes
  useEffect(() => {
    setFavoriteNotes(notes.filter((note) => note.isFavorite)); // Update state with filtered favorite notes
  }, [notes]);

  // Function to update notes when saving changes from modal
  const handleSave = async (updatedNote) => {
    try {
      const token = localStorage.getItem("token");
  
      // Send backend update request
      const res = await axios.put(
        `http://localhost:8080/notes/${updatedNote._id}`,
        updatedNote, // Send updated note
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const savedNote = res.data; // Get updated note from backend
  
      // Update global `notes` state
      setNotes((prevNotes) =>
        prevNotes.map((n) => (n._id === savedNote._id ? savedNote : n))
      );
  
      // Update `favoriteNotes` as well
      setFavoriteNotes((prevFavorites) =>
        prevFavorites.map((n) => (n._id === savedNote._id ? savedNote : n))
      );
  
      setSelectedNote(null); // ❗ Close the modal after saving
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
              onSelect={() => setSelectedNote(note)} // Open modal
              onToggleFavorite={() => toggleFavorite(note._id, note.isFavorite)}
            />
          ))}
        </div>
      )}

      {/* If a note is selected, show the modal to edit */}
      {selectedNote && (
        <NoteModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)} // Close modal
          onSave={handleSave} // Update notes when saved
          onToggleFavorite={() => toggleFavorite(selectedNote._id, selectedNote.isFavorite)}
        />
      )}
    </div>
  );
}
