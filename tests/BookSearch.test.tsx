import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import BookSearch from "../src/pages/BookSearch";
import { FavoritesProvider } from "../src/context/FavoritesContext";
import * as openLibrary from "../src/lib/openLibrary";

vi.mock("../src/lib/openLibrary", async () => {
  const actual = await vi.importActual<typeof openLibrary>(
    "../src/lib/openLibrary",
  );
  return {
    ...actual,
    searchBooks: vi.fn(),
  };
});

const searchBooksMock = vi.mocked(openLibrary.searchBooks);

function renderBookSearch() {
  return render(
    <MemoryRouter>
      <FavoritesProvider>
        <BookSearch />
      </FavoritesProvider>
    </MemoryRouter>,
  );
}

describe("BookSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    searchBooksMock.mockReset();
    searchBooksMock.mockResolvedValue({ books: [], hasMore: false });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not search below the minimum query length", async () => {
    const user = userEvent.setup({ delay: null });
    renderBookSearch();

    await user.type(screen.getByLabelText(/search by title/i), "du");
    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    expect(searchBooksMock).not.toHaveBeenCalled();
  });

  it("waits for the debounce before searching after typing", async () => {
    const user = userEvent.setup({ delay: null });
    renderBookSearch();

    await user.type(screen.getByLabelText(/search by title/i), "dune");

    // Not yet - debounce hasn't elapsed.
    expect(searchBooksMock).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    expect(searchBooksMock).toHaveBeenCalledWith(
      "dune",
      1,
      expect.any(Number),
      expect.anything(),
    );
  });

  it("shows an error message returned by getErrorMessage on failure", async () => {
    searchBooksMock.mockRejectedValue(new openLibrary.ApiError("nope", 429));
    const user = userEvent.setup({ delay: null });
    renderBookSearch();

    await user.type(screen.getByLabelText(/search by title/i), "dune");
    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    expect(await screen.findByText(/rate-limiting/i)).toBeInTheDocument();
  });
});
