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
    <div className="note-card border p-4 rounded-lg shadow-md bg-white hover:shadow-lg transition">
      {/* Header */}
      <div className="flex justify-between items-center">
        {isRenaming ? (
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            autoFocus
            className="border px-2 py-1 rounded-md w-full outline-none"
          />
        ) : (
          <h3 className="font-bold text-lg" onClick={() => setIsRenaming(true)}>
            {note.title}
          </h3>
        )}
        <div className="flex gap-2">
        <button onClick={onToggleFavorite} className="text-yellow-500 text-2xl">
          {note.isFavorite ? "⭐" : "☆"}
        </button>
          <button
            className="text-xl"
            onClick={() => navigator.clipboard.writeText(note.content)}
          >
            📋
          </button>
          {onDelete && (
            <button className="text-xl text-red-500" onClick={onDelete}>
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* Timestamp */}
      <p className="text-xs text-gray-500">
        Created on: {format(new Date(note.createdAt), "PPpp")}
      </p>

      {/* Content */}
      <div className="mt-2" onClick={() => onSelect(note)}>
        <p>{note.content.length > 100 ? `${note.content.substring(0, 100)}...` : note.content}</p>
        {note.image && (
          <img
            src={note.image}
            alt="Note attachment"
            className="mt-2 rounded-lg w-full h-auto"
          />
        )}
      </div>
    </div>
  );
}
