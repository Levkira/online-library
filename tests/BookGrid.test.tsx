import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BookGrid from "../src/components/BookGrid";
import { FavoritesProvider } from "../src/context/FavoritesContext";
import type { Book } from "../src/lib/openLibrary";

const books: Book[] = [
  { key: "/works/OL1W", title: "Dune", authorNames: ["Frank Herbert"] },
  { key: "/works/OL2W", title: "The Hobbit", authorNames: ["J.R.R. Tolkien"] },
  { key: "/works/OL3W", title: "Foundation", authorNames: ["Isaac Asimov"] },
];

function renderGrid(list: Book[]) {
  return render(
    <MemoryRouter>
      <FavoritesProvider>
        <BookGrid books={list} />
      </FavoritesProvider>
    </MemoryRouter>,
  );
}

describe("BookGrid", () => {
  it("renders one card per book", () => {
    renderGrid(books);
    expect(screen.getByText("Dune")).toBeInTheDocument();
    expect(screen.getByText("The Hobbit")).toBeInTheDocument();
    expect(screen.getByText("Foundation")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("renders nothing but an empty grid when given no books", () => {
    const { container } = renderGrid([]);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(container.querySelector(".grid")?.children.length).toBe(0);
  });
});
