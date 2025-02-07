import { useState, useEffect } from "react";
import axios from "axios";
import NoteCard from "../components/NoteCard";
import NoteModal from "../components/NoteModal";
import { useNotes } from "../context/NotesContext"; // Use the context

export default function Home({ user }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);

  const { notes, setNotes, fetchNotes, toggleFavorite } = useNotes(); // Access global state and functions

  useEffect(() => {
    fetchNotes();
    setupSpeechRecognition();
  }, []);

  const setupSpeechRecognition = () => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join(" ");
        setNewNote((prev) => ({ ...prev, content: prev.content + " " + transcript }));
      };

      setRecognition(recognitionInstance);
    }
  };

  const startRecording = () => {
    if (recognition) {
      setIsRecording(true);
      recognition.start();
    }
  };

  const stopRecording = () => {
    if (recognition) {
      setIsRecording(false);
      recognition.stop();
    }
  };

  const createNote = async () => {
    if (!newNote.title.trim()) {
      alert("Error: Note title cannot be empty!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:8080/notes",
        newNote,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotes([res.data, ...notes]); // Optimistically add new note to the state
      setNewNote({ title: "", content: "", image: null, audio: null });
    } catch (err) {
      console.error("Error creating note:", err);
    }
  };

  const deleteNote = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`http://localhost:8080/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotes(notes.filter((note) => note._id !== id));
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  const toggleFavoriteNote = async (id, currentStatus) => {
    try {
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note._id === id ? { ...note, isFavorite: !currentStatus } : note
        )
      );

      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:8080/notes/${id}`,
        { isFavorite: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotes((prevNotes) =>
        prevNotes.map((note) => (note._id === id ? res.data : note))
      );

      if (selectedNote && selectedNote._id === id) {
        setSelectedNote(res.data);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const handleSave = async (updatedNote) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:8080/notes/${updatedNote._id}`,
        updatedNote,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const savedNote = res.data;

      setNotes((prevNotes) =>
        prevNotes.map((n) => (n._id === savedNote._id ? savedNote : n))
      );

      setSelectedNote(null);
    } catch (err) {
      console.error("Error updating note:", err);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search notes..."
        className="w-full p-2 border rounded-md mb-4 outline-none"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Note Creation */}
      <div className="p-4 border rounded-lg shadow-md bg-white mb-4">
        <input
          type="text"
          placeholder="Note title"
          value={newNote.title}
          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
          className="border p-2 w-full rounded-md outline-none mb-2"
        />
        <textarea
          placeholder="Start typing or record audio"
          value={newNote.content}
          onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
          className="w-full p-2 border rounded-md h-24 outline-none resize-none mb-2"
        />

        {/* Record Audio Button */}
        <div className="flex gap-3">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={createNote}
          >
            Save Note
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              isRecording ? "bg-red-500 text-white" : "bg-gray-300"
            } hover:opacity-80`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? "Stop Recording" : "Start Recording"}
          </button>
        </div>
      </div>

      {/* Notes List */}
      {notes.length === 0 ? (
        <p className="text-gray-500 text-center">No notes found. Start adding notes!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {notes
            .filter((note) =>
              note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              note.content.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onDelete={() => deleteNote(note._id)}
                onSelect={setSelectedNote}
                onToggleFavorite={() => toggleFavoriteNote(note._id, note.isFavorite)}
              />
            ))}
        </div>
      )}

      {/* Note Modal */}
      {selectedNote && (
        <NoteModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onSave={handleSave}
          onToggleFavorite={toggleFavoriteNote}
        />
      )}
    </div>
  );
}
