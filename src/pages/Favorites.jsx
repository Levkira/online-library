import { useFavorites } from "../context/FavoritesContext";
import BookCard from "../components/BookCard";

function Favorites() {
  const { favorites } = useFavorites();
  const books = Object.values(favorites);

  if (!books.length) {
    return (
      <p className="text-center  text-gray-500 mt-5 text-3xl">
        No favorites yet
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {books.map((book) => (
        <BookCard key={book.key} book={book} />
      ))}
    </div>
  );
}

export default Favorites;
