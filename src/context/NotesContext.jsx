import { createContext, useState, useContext } from "react";
import axios from "axios"; // Import axios

// Create Context for Notes
const NotesContext = createContext();

// Create a custom hook to use the context
export const useNotes = () => useContext(NotesContext);

// Context Provider component
export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8080/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(res.data);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  const toggleFavorite = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");

      // Optimistically update the UI
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note._id === id ? { ...note, isFavorite: !currentStatus } : note
        )
      );

      // Backend update request
      const res = await axios.put(
        `http://localhost:8080/notes/${id}`,
        { isFavorite: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Sync the notes with the updated data
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note._id === id ? res.data : note))
      );
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  return (
    <NotesContext.Provider value={{ notes, setNotes, fetchNotes, toggleFavorite }}>
      {children}
    </NotesContext.Provider>
  );
};
