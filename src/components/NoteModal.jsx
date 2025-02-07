import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function NoteModal({ note, onClose, onSave, onToggleFavorite }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editedTitle, setEditedTitle] = useState(note.title);
  const [editedContent, setEditedContent] = useState(note.content);
  const [imagePreview, setImagePreview] = useState(note.image || null);

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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50">
      <div
        className={`bg-white rounded-lg shadow-xl p-6 transition-all transform ${
          isFullscreen ? "w-full h-full max-w-none m-4" : "w-[90%] sm:w-[500px]"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2">
          <input
            type="text"
            className="text-xl font-bold w-full bg-transparent outline-none focus:ring-2 focus:ring-blue-400"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
          />
          <div className="flex gap-2">
            {/* Fullscreen Button */}
            <button
              className="text-xl text-gray-600 hover:text-blue-500 transition"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? "⬜" : "⛶"}
            </button>

            {/* Favorite Button */}
            <button
              onClick={() => onToggleFavorite(note._id, note.isFavorite)}
              className={`text-2xl transition ${
                note.isFavorite ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"
              }`}
            >
              {note.isFavorite ? "⭐" : "☆"}
            </button>

            {/* Close Button */}
            <button className="text-xl text-red-500 hover:text-red-700 transition" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* Timestamp */}
        <p className="text-xs text-gray-500 mt-2">
          📅 Created on: {format(new Date(note.createdAt), "PPpp")}
        </p>

        {/* Content */}
        <div className="mt-4">
          <textarea
            className="w-full h-40 border p-2 rounded-md outline-none resize-none focus:ring-2 focus:ring-blue-400"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          />

          {/* ✅ Show Image if Available */}
          {imagePreview && (
            <div className="mt-3">
              <img
                src={imagePreview}
                alt="Note attachment"
                className="w-full h-auto rounded-md shadow-md"
              />
            </div>
          )}

          {/* ✅ Image Upload */}
          <input
            type="file"
            accept="image/*"
            className="mt-3 block text-sm text-gray-600"
            onChange={handleImageUpload}
          />
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
