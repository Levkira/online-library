import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useFavorites as useFavoritesHook } from "../hooks/useFavorites";
import type { Book } from "../lib/openLibrary";

interface FavoritesContextValue {
  favorites: Book[];
  toggleFavorite: (book: Book) => void;
  isFavorite: (key: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { favorites, toggleFavorite, isFavorite } = useFavoritesHook();

  const value = useMemo(
    () => ({ favorites, toggleFavorite, isFavorite }),
    [favorites, toggleFavorite, isFavorite],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used inside FavoritesProvider");
  }
  return ctx;
}
