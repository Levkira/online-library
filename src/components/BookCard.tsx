import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import type { Book } from "../lib/openLibrary";

interface BookCardProps {
  book: Book;
}

function BookCard({ book }: BookCardProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const workId = book.key.replace("/works/", "");
  const favorite = isFavorite(book.key);

  return (
    <div className="book-card flex flex-col h-full overflow-hidden">
      <Link to={`/works/${workId}`}>
        {book.coverId ? (
          <img
            src={`https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`}
            alt={book.title}
            className="h-64 w-full object-cover"
          />
        ) : (
          <div className="h-64 bg-gray-200 flex items-center justify-center text-sm">
            No Cover
          </div>
        )}
      </Link>

      <div className="p-2 flex flex-col flex-1">
        <h3 className="text-white font-bold text-base mt-4 line-clamp-2">
          {book.title}
        </h3>

        {book.authorNames.length > 0 && (
          <p className="text-xs text-gray-500 mt-1 mb-3 line-clamp-1">
            {book.authorNames.join(", ")}
          </p>
        )}

        <button
          type="button"
          onClick={() => toggleFavorite(book)}
          aria-pressed={favorite}
          className="mt-auto text-sm text-amber-400"
        >
          {favorite ? "Favorite ★" : "Save in ☆"}
        </button>
      </div>
    </div>
  );
}

export default BookCard;
