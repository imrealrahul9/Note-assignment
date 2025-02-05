import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function NoteModal({ note, onClose, onSave, onToggleFavorite }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editedTitle, setEditedTitle] = useState(note.title);
  const [editedContent, setEditedContent] = useState(note.content);
  const [imagePreview, setImagePreview] = useState(note.image || null);

  // Sync modal state if the selected note changes
  useEffect(() => {
    setEditedTitle(note.title);
    setEditedContent(note.content);
    setImagePreview(note.image || null);
  }, [note]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({
      ...note,
      title: editedTitle || "Untitled Note",
      content: editedContent,
      image: imagePreview,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div
        className={`bg-white rounded-lg shadow-lg p-6 w-full max-w-lg transition-all ${
          isFullscreen ? "w-full h-full max-w-none" : "w-[90%] sm:w-[500px]"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2">
          <input
            type="text"
            className="text-xl font-bold w-full bg-transparent outline-none"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              className="text-xl"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? "⬜" : "⛶"}
            </button>
            <button onClick={() => onToggleFavorite(note._id, note.isFavorite)} className="text-yellow-500 text-2xl">
              {note.isFavorite ? "⭐" : "☆"}
            </button>
            <button className="text-xl" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* Timestamp */}
        <p className="text-xs text-gray-500">
          Created on: {format(new Date(note.createdAt), "PPpp")}
        </p>

        {/* Content */}
        <div className="mt-4">
          <textarea
            className="w-full h-40 border p-2 rounded-md outline-none resize-none"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          />
          {imagePreview && (
            <div className="mt-3">
              <img
                src={imagePreview}
                alt="Note attachment"
                className="w-full h-auto rounded-md"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="mt-3 block"
            onChange={handleImageUpload}
          />
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-end gap-3">
          <button className="px-4 py-2 bg-gray-300 rounded-md" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
