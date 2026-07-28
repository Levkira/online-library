import { useCallback, useEffect, useState } from "react";
import type { Book } from "../lib/openLibrary";

const STORAGE_KEY = "favorites";

function loadFavorites(): Book[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Book[]) : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Book[]>(loadFavorites);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      
    }
  }, [favorites]);

  const toggleFavorite = useCallback((book: Book) => {
    setFavorites((prev) =>
      prev.find((b) => b.key === book.key)
        ? prev.filter((b) => b.key !== book.key)
        : [...prev, book],
    );
  }, []);

  const isFavorite = useCallback(
    (key: string) => favorites.some((b) => b.key === key),
    [favorites],
  );

  return { favorites, toggleFavorite, isFavorite };
}
