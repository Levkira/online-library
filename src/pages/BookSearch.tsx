import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useDebounce, useIntersection } from "react-use";
import BookGrid from "../components/BookGrid";
import Loading from "../components/Loading";
import { searchBooks, type Book } from "../lib/openLibrary";

const LIMIT = 12;
const MIN_QUERY_LENGTH = 3;

function BookSearch() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const intersection = useIntersection(loaderRef, {
    root: null,
    threshold: 1,
  });

  useDebounce(
    () => {
      const normalizedQuery = query.trim();
      if (normalizedQuery.length < MIN_QUERY_LENGTH || !hasMore) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      searchBooks(normalizedQuery, page, LIMIT, controller.signal)
        .then(({ books: newBooks, hasMore: more }) => {
          setBooks((prev) => (page === 1 ? newBooks : [...prev, ...newBooks]));
          setHasMore(more);
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setHasMore(false);
          setError("Couldn't search right now. Please try again.");
        })
        .finally(() => setLoading(false));
    },
    600,
    [query, page],
  );

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    if (
      intersection?.isIntersecting &&
      !loading &&
      hasMore &&
      query.length >= MIN_QUERY_LENGTH
    ) {
      setPage((p) => p + 1);
    }
  }, [intersection, loading, hasMore, query]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setPage(1);
    setBooks([]);
    setHasMore(true);
    setError(null);
  };

  return (
    <>
      <div className="flex justify-around items-center mt-10 mb-15">
        <h2 className="text-xl font-bold">Search Books</h2>
        <div className="search">
          <div className="relative flex items-center">
            <img
              src="icon-search.png"
              alt=""
              aria-hidden="true"
              className="absolute left-2 h-5 w-5"
            />
            <label className="sr-only" htmlFor="book-search-input">
              Search by title, author, or keyword
            </label>
            <input
              id="book-search-input"
              type="text"
              value={query}
              onChange={onChange}
              placeholder="Search by title, author, keyword..."
            />
          </div>
        </div>
      </div>
      <div>
        <BookGrid books={books} />

        {error && <p className="text-center text-red-400 mt-4">{error}</p>}
        {loading && <Loading />}
        <div ref={loaderRef} className="h-10" />
      </div>
    </>
  );
}

export default BookSearch;
