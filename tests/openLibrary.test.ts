import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchSubjectBooks,
  fetchWorkDetails,
  searchBooks,
  type Book,
} from "../src/lib/openLibrary";


class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function appendUniqueBooks(existing: Book[], incoming: Book[]) {
  const seen = new Set(existing.map((b) => b.key));
  const result = [...existing];
  for (const b of incoming) {
    if (!seen.has(b.key)) {
      seen.add(b.key);
      result.push(b);
    }
  }
  return result;
}


function getErrorMessage(err: unknown) {
  if (err instanceof ApiError) {
    if (err.status === 429) return "We're being rate-limited";
    if (err.status === 404) return "Nothing found";
    if (err.status >= 500) return "The server is having trouble";
  }
  if (err instanceof TypeError) return 'A network error occurred';
  return 'Something went wrong';
}

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
  });
}

describe("openLibrary", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("searchBooks", () => {
    it("builds the correct request URL with encoded query", async () => {
      const fetchMock = mockFetchOnce({ docs: [] });
      vi.stubGlobal("fetch", fetchMock);

      await searchBooks("harry potter & the cup", 2, 12);

      const calledUrl = fetchMock.mock.calls[0][0] as string;
      expect(calledUrl).toContain("/search.json?q=harry%20potter%20%26%20the%20cup");
      expect(calledUrl).toContain("page=2");
      expect(calledUrl).toContain("limit=12");
    });

    it("normalizes docs into Book objects", async () => {
      vi.stubGlobal(
        "fetch",
        mockFetchOnce({
          docs: [
            {
              key: "/works/OL1W",
              title: "Dune",
              cover_i: 123,
              author_name: ["Frank Herbert"],
            },
          ],
        }),
      );

      const result = await searchBooks("dune", 1, 12);

      expect(result.books).toEqual([
        {
          key: "/works/OL1W",
          title: "Dune",
          coverId: 123,
          authorNames: ["Frank Herbert"],
        },
      ]);
    });

    it("defaults missing author_name to an empty array", async () => {
      vi.stubGlobal(
        "fetch",
        mockFetchOnce({
          docs: [{ key: "/works/OL2W", title: "Untitled Work" }],
        }),
      );

      const result = await searchBooks("x", 1, 12);
      expect(result.books[0].authorNames).toEqual([]);
      expect(result.books[0].coverId).toBeUndefined();
    });

    it("sets hasMore true when a full page of results is returned", async () => {
      const docs = Array.from({ length: 12 }, (_, i) => ({
        key: `/works/OL${i}W`,
        title: `Book ${i}`,
      }));
      vi.stubGlobal("fetch", mockFetchOnce({ docs }));

      const result = await searchBooks("x", 1, 12);
      expect(result.hasMore).toBe(true);
    });

    it("sets hasMore false when fewer results than the limit are returned", async () => {
      vi.stubGlobal(
        "fetch",
        mockFetchOnce({ docs: [{ key: "/works/OL1W", title: "Only One" }] }),
      );

      const result = await searchBooks("x", 1, 12);
      expect(result.hasMore).toBe(false);
    });

    it("returns an empty, non-more result when docs is missing or malformed", async () => {
      vi.stubGlobal("fetch", mockFetchOnce({}));
      const result = await searchBooks("x", 1, 12);
      expect(result).toEqual({ books: [], hasMore: false });
    });

    it("throws a descriptive error on a non-ok response", async () => {
      vi.stubGlobal("fetch", mockFetchOnce({}, false, 429));
      await expect(searchBooks("x", 1, 12)).rejects.toThrow("failed with status 429");
    });
  });

  describe("fetchSubjectBooks", () => {
    it("builds the correct offset-based URL", async () => {
      const fetchMock = mockFetchOnce({ works: [] });
      vi.stubGlobal("fetch", fetchMock);

      await fetchSubjectBooks("fantasy", 3, 20);

      const calledUrl = fetchMock.mock.calls[0][0] as string;
      expect(calledUrl).toContain("/subjects/fantasy.json?limit=20&offset=60");
    });

    it("normalizes subject works, including nested author names", async () => {
      vi.stubGlobal(
        "fetch",
        mockFetchOnce({
          works: [
            {
              key: "/works/OL5W",
              title: "The Hobbit",
              cover_id: 55,
              authors: [{ name: "J.R.R. Tolkien" }],
            },
          ],
        }),
      );

      const result = await fetchSubjectBooks("fantasy", 0, 20);
      expect(result.books).toEqual([
        {
          key: "/works/OL5W",
          title: "The Hobbit",
          coverId: 55,
          authorNames: ["J.R.R. Tolkien"],
        },
      ]);
    });

    it("defaults missing authors to an empty array", async () => {
      vi.stubGlobal(
        "fetch",
        mockFetchOnce({ works: [{ key: "/works/OL6W", title: "No Authors" }] }),
      );
      const result = await fetchSubjectBooks("fantasy", 0, 20);
      expect(result.books[0].authorNames).toEqual([]);
    });
  });

  describe("fetchWorkDetails", () => {
    it("extracts description when it's a plain string", async () => {
      vi.stubGlobal(
        "fetch",
        mockFetchOnce({
          title: "Dune",
          description: "A story about spice.",
          covers: [1, -1, 2],
          subjects: ["Science fiction"],
        }),
      );

      const result = await fetchWorkDetails("OL1W");
      expect(result.description).toBe("A story about spice.");
      expect(result.covers).toEqual([1, -1, 2]);
    });

    it("extracts description when it's wrapped in a {value} object", async () => {
      vi.stubGlobal(
        "fetch",
        mockFetchOnce({
          title: "Dune",
          description: { value: "A story about spice, wrapped." },
        }),
      );

      const result = await fetchWorkDetails("OL1W");
      expect(result.description).toBe("A story about spice, wrapped.");
    });

    it("leaves description undefined when absent", async () => {
      vi.stubGlobal("fetch", mockFetchOnce({ title: "No Description" }));
      const result = await fetchWorkDetails("OL9W");
      expect(result.description).toBeUndefined();
    });

    it("propagates abort errors so callers can distinguish them", async () => {
      const abortError = new DOMException("Aborted", "AbortError");
      vi.stubGlobal(
        "fetch",
        vi.fn().mockRejectedValue(abortError),
      );

      await expect(fetchWorkDetails("OL1W")).rejects.toThrow("Aborted");
    });
  });

  describe("response caching", () => {
    it("does not re-fetch a URL it has already fetched successfully", async () => {
      const fetchMock = mockFetchOnce({ title: "Dune" });
      vi.stubGlobal("fetch", fetchMock);

      await fetchWorkDetails("OL1W");
      await fetchWorkDetails("OL1W");

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("fetches again for a different URL", async () => {
      const fetchMock = mockFetchOnce({ title: "Dune" });
      vi.stubGlobal("fetch", fetchMock);

      await fetchWorkDetails("OL1W");
      await fetchWorkDetails("OL2W");

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("does not cache a failed request", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 500, json: () => Promise.resolve({}) })
        .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ title: "Dune" }) });
      vi.stubGlobal("fetch", fetchMock);

      await expect(fetchWorkDetails("OL1W")).rejects.toThrow();
      const result = await fetchWorkDetails("OL1W");

      expect(result.title).toBe("Dune");
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  describe("getErrorMessage", () => {
    it("gives a rate-limit specific message for a 429 ApiError", () => {
      expect(getErrorMessage(new ApiError("nope", 429))).toMatch(/rate-limiting/i);
    });

    it("gives a not-found message for a 404 ApiError", () => {
      expect(getErrorMessage(new ApiError("nope", 404))).toMatch(/nothing found/i);
    });

    it("gives a server-trouble message for a 5xx ApiError", () => {
      expect(getErrorMessage(new ApiError("nope", 503))).toMatch(/trouble/i);
    });

    it("gives a network-specific message for a TypeError", () => {
      expect(getErrorMessage(new TypeError("Failed to fetch"))).toMatch(/network/i);
    });

    it("falls back to a generic message for anything else", () => {
      expect(getErrorMessage("not even an Error")).toMatch(/something went wrong/i);
    });
  });

  describe("appendUniqueBooks", () => {
    const bookA: Book = { key: "/works/OL1W", title: "A", authorNames: [] };
    const bookB: Book = { key: "/works/OL2W", title: "B", authorNames: [] };

    it("appends new books after existing ones", () => {
      expect(appendUniqueBooks([bookA], [bookB])).toEqual([bookA, bookB]);
    });

    it("drops incoming books whose key already exists", () => {
      const bookADuplicate: Book = { key: "/works/OL1W", title: "A again", authorNames: [] };
      expect(appendUniqueBooks([bookA], [bookADuplicate, bookB])).toEqual([bookA, bookB]);
    });

    it("drops duplicates within the incoming batch itself", () => {
      expect(appendUniqueBooks([], [bookB, bookB])).toEqual([bookB]);
    });
  });
});
