import NoteCard from "../components/NoteCard";

export default function Favorites({ notes = [] }) { 
  const favoriteNotes = notes.filter((note) => note.isFavorite);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Favorite Notes</h2>
      {favoriteNotes.length === 0 ? (
        <p className="text-gray-500">No favorite notes yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteNotes.map((note) => (
            <NoteCard key={note._id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
