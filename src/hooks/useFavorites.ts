import { useCallback, useEffect, useState } from "react";
import type { Book } from "../lib/openLibrary";

const STORAGE_KEY = "favorites";

function isBook(value: unknown): value is Book {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.key === "string" &&
    typeof candidate.title === "string" &&
    (candidate.coverId === undefined ||
      typeof candidate.coverId === "number") &&
    Array.isArray(candidate.authorNames) &&
    candidate.authorNames.every((name) => typeof name === "string")
  );
}

function loadFavorites(): Book[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isBook);
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
      // Storage may be unavailable (quota exceeded, private browsing, etc.);
      // favorites still work for the current session via React state.
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
