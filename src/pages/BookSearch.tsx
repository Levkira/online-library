import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useDebounce, useIntersection } from "react-use";
import BookGrid from "../components/BookGrid";
import Loading from "../components/Loading";
import {
  appendUniqueBooks,
  getErrorMessage,
  isAbortError,
  searchBooks,
  type Book,
} from "../lib/openLibrary";

const LIMIT = 12;
const MIN_QUERY_LENGTH = 3;

function BookSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loaderRef = useRef<HTMLDivElement>(null);

  const intersection = useIntersection(
    loaderRef as React.RefObject<HTMLElement>,
    { root: null, threshold: 1 },
  );

  useDebounce(
    () => {
      setDebouncedQuery(query.trim());
    },
    600,
    [query],
  );

  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets
      setBooks([]);
      setHasMore(true);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    searchBooks(debouncedQuery, page, LIMIT, controller.signal)
      .then(({ books: newBooks, hasMore: more }) => {
        setBooks((prev) =>
          page === 1 ? newBooks : appendUniqueBooks(prev, newBooks),
        );
        setHasMore(more);
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setHasMore(false);
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [debouncedQuery, page]);

  useEffect(() => {
    if (
      intersection?.isIntersecting &&
      !loading &&
      hasMore &&
      debouncedQuery.length >= MIN_QUERY_LENGTH
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reacts
      setPage((p) => p + 1);
    }
  }, [intersection, loading, hasMore, debouncedQuery]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setPage(1);
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
