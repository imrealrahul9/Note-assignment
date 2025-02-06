import { useState, useEffect } from "react";
import axios from "axios";
import NoteCard from "../components/NoteCard";
import NoteModal from "../components/NoteModal";

export default function Home({ user }) {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    fetchNotes();
    setupSpeechRecognition();
  }, []);

  //  Fetch Notes from MongoDB
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

  // Setup Speech Recognition
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

  // Create Note
  const createNote = async () => {
    if (!newNote.title.trim()) {
      alert("Error: Note title cannot be empty!");
      return;
    }
    if (!newNote.content.trim()){
      alert("Error: Note content cannot be empty!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:8080/notes",
        { ...newNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes([res.data, ...notes]);
      setNewNote({ title: "", content: "" });
    } catch (err) {
      console.error("Error creating note:", err);
    }
  };

  // Start Recording
  const startRecording = () => {
    if (recognition) {
      // setNewNote({ title: "", content: "" });
      recognition.start();
      setIsRecording(true);
      setTimeout(() => stopRecording(), 60000);
    }
  };

  // Stop Recording & Save
  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
      // if (newNote.content.trim()) {
      //   createNote();
      // }
    }
  };

  // Delete Note
  const deleteNote = async (id) => {
    try {
      console.log("🔹 Sending DELETE request for note:", id); // ✅ Debugging
  
      const token = localStorage.getItem("token");
      const res = await axios.delete(`http://localhost:8080/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log("✅ Note deleted:", res.data);
      setNotes(notes.filter((note) => note._id !== id));
    } catch (err) {
      console.error("❌ Error deleting note:", err.response?.data || err.message);
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
  
      if (selectedNote && selectedNote._id === id) {
        setSelectedNote({ ...selectedNote, isFavorite: !currentStatus });
      }
  
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
  

  return (
    <div className="p-4 max-w-3xl mx-auto">

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search notes..."
        className="w-full p-2 border rounded-md mb-4 outline-none"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Note Creation Section */}
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
                onToggleFavorite={() => toggleFavorite(note._id, note.isFavorite)}
              />
            ))}
        </div>
      )}

      {/* Note Modal */}
      {selectedNote && (
        <NoteModal
        note={selectedNote}
        onClose={() => setSelectedNote(null)}
        onSave={(updatedNote) => {
          setNotes(notes.map((n) => (n._id === updatedNote._id ? updatedNote : n)));
          setSelectedNote(updatedNote);
        }}
        onToggleFavorite={toggleFavorite}
      />
      )}
    </div>
  );
}
