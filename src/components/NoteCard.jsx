import { useState } from "react";
import { format } from "date-fns";


export default function NoteCard({ note, onSelect, onDelete, onRename, onToggleFavorite }) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(note.title);

  const handleRename = () => {
    if (newTitle.trim()) {
      onRename({ ...note, title: newTitle });
    }
    setIsRenaming(false);
  };

  return (
    <div className="border p-4 rounded-lg shadow-lg bg-gradient-to-r from-blue-50 to-purple-100 hover:shadow-xl transition duration-300">

      <div className="flex justify-between items-center">
        {isRenaming ? (
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            autoFocus
            className="border px-2 py-1 rounded-md w-full outline-none focus:ring-2 focus:ring-blue-400"
          />
        ) : (
          <h3
            className="font-bold text-lg text-gray-800 cursor-pointer hover:text-blue-600"
            onClick={() => setIsRenaming(true)}
          >
            {note.title}
          </h3>
        )}
        <div className="flex gap-2">

          <button
            onClick={onToggleFavorite}
            className={`text-2xl transition ${
              note.isFavorite ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"
            }`}
          >
            {note.isFavorite ? "⭐" : "☆"}
          </button>

          <button
            className="text-xl text-gray-600 hover:text-blue-500 transition"
            onClick={() => navigator.clipboard.writeText(note.content)}
          >
            📋
          </button>

          {onDelete && (
            <button className="text-xl text-red-500 hover:text-red-700 transition" onClick={onDelete}>
              🗑️
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-600 mt-1">📅 {format(new Date(note.createdAt), "PPpp")}</p>

      <div className="mt-3 cursor-pointer" onClick={() => onSelect(note)}>
        <p className="text-gray-700">
          {note.content.length > 100 ? `${note.content.substring(0, 100)}...` : note.content}
        </p>

        {note.image && (
          <img
            src={note.image}
            alt="Note attachment"
            className="mt-3 rounded-lg w-full h-auto object-cover shadow-md"
          />
        )}

        {note.audio && (
          <audio controls className="mt-3 w-full">
            <source src={note.audio} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        )}
      </div>
    </div>
  );
}
