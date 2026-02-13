import { createContext, useContext } from "react";
import { useFavorites as useFavoritesHook } from "../hooks/useFavorites";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const favorites = useFavoritesHook();
  return (
    <FavoritesContext.Provider value={favorites}>
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
