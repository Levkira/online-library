import { useEffect, useState } from "react";

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (book) => {
    setFavorites((prev) =>
      prev.find((b) => b.key === book.key)
        ? prev.filter((b) => b.key !== book.key)
        : [...prev, book],
    );
  };

  const isFavorite = (key) => favorites.some((b) => b.key === key);

  return { favorites, toggleFavorite, isFavorite };
}
