import { useFavorites } from "../context/FavoritesContext";
import BookGrid from "../components/BookGrid";
import { Link } from "react-router-dom";

function Favorites() {
  const { favorites } = useFavorites();

  if (!favorites.length) {
    return (
      <p className="text-center text-gray-500 mt-5 text-3xl">
        No favorites yet
      </p>
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
