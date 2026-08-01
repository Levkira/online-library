import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import BookCard from "../src/components/BookCard";
import { FavoritesProvider } from "../src/context/FavoritesContext";
import type { Book } from "../src/lib/openLibrary";

const bookWithCover: Book = {
  key: "/works/OL1W",
  title: "Dune",
  coverId: 123,
  authorNames: ["Frank Herbert"],
};

const bookWithoutCover: Book = {
  key: "/works/OL2W",
  title: "Mystery Novel",
  authorNames: [],
};

function renderBookCard(book: Book) {
  return render(
    <MemoryRouter>
      <FavoritesProvider>
        <BookCard book={book} />
      </FavoritesProvider>
    </MemoryRouter>,
  );
}

describe("BookCard", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the cover image when coverId is present", () => {
    renderBookCard(bookWithCover);
    const img = screen.getByRole("img", { name: "Dune" });
    expect(img).toHaveAttribute(
      "src",
      "https://covers.openlibrary.org/b/id/123-M.jpg",
    );
  });

  it("renders a No Cover placeholder when coverId is absent", () => {
    renderBookCard(bookWithoutCover);
    expect(screen.getByText("No Cover")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("shows the author line when authors are present", () => {
    renderBookCard(bookWithCover);
    expect(screen.getByText("Frank Herbert")).toBeInTheDocument();
  });

  it("omits the author line when there are no authors", () => {
    renderBookCard(bookWithoutCover);
    expect(screen.queryByText(/./, { selector: "p.text-xs" })).not.toBeInTheDocument();
  });

  it("links to the work's detail page with the /works/ prefix stripped", () => {
    renderBookCard(bookWithCover);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/works/OL1W");
  });

  it("toggles favorite state when the button is clicked", async () => {
    const user = userEvent.setup();
    renderBookCard(bookWithCover);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toHaveTextContent("Save in ☆");

    await user.click(button);

    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveTextContent("Favorite ★");
  });

  it("exposes a descriptive aria-label that updates with favorite state", async () => {
    const user = userEvent.setup();
    renderBookCard(bookWithCover);

    const button = screen.getByRole("button", {
      name: "Save Dune to favorites",
    });

    await user.click(button);

    expect(
      screen.getByRole("button", { name: "Remove Dune from favorites" }),
    ).toBeInTheDocument();
  });

  it("falls back to the No Cover placeholder if the cover image fails to load", () => {
    renderBookCard(bookWithCover);

    const img = screen.getByRole("img", { name: "Dune" });
    fireEvent.error(img);

    expect(screen.getByText("No Cover")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
