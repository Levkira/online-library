import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Favorites from "../src/pages/Favorites";
import { FavoritesProvider } from "../src/context/FavoritesContext";
import type { Book } from "../src/lib/openLibrary";

function renderFavorites() {
  return render(
    <MemoryRouter>
      <FavoritesProvider>
        <Favorites />
      </FavoritesProvider>
    </MemoryRouter>,
  );
}

describe("Favorites page", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows an empty state message when there are no favorites", () => {
    renderFavorites();
    expect(screen.getByText("No favorites yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back/i })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("renders favorited books from localStorage", () => {
    const saved: Book[] = [
      { key: "/works/OL1W", title: "Dune", authorNames: ["Frank Herbert"] },
    ];
    localStorage.setItem("favorites", JSON.stringify(saved));

    renderFavorites();

    expect(screen.queryByText("No favorites yet")).not.toBeInTheDocument();
    expect(screen.getByText("Dune")).toBeInTheDocument();
  });
});
