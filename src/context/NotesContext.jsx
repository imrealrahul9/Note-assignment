import { createContext, useState, useContext } from "react";
import axios from "axios"; // Import axios


const NotesContext = createContext();


export const useNotes = () => useContext(NotesContext);

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://note-assignment-v8bm.onrender.com/notes", {
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

      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note._id === id ? { ...note, isFavorite: !currentStatus } : note
        )
      );

      const res = await axios.put(
        `https://note-assignment-v8bm.onrender.com/notes/${id}`,
        { isFavorite: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

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
