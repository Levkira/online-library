import { Link } from "react-router-dom";
import BookGrid from "../components/BookGrid";
import { useFavorites } from "../context/FavoritesContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

function Favorites() {
  const { favorites } = useFavorites();
  useDocumentTitle("Favorites");

  if (!favorites.length) {
    return (
      <div>
        <Link to="/" className="text-amber-400 mb-4 inline-block">
          ← Back
        </Link>
        <p className="text-center text-gray-500 mt-5 text-3xl">
          No favorites yet
        </p>
      </div>
    );
  }

  return (
    <div>
      <Link to="/" className="text-amber-400 mb-4 inline-block">
        ← Back
      </Link>
      <BookGrid books={favorites} />
    </div>
  );
}

export default Favorites;
