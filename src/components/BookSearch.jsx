import { useEffect, useRef, useState } from "react";
import { useDebounce, useIntersection } from "react-use";
import BookCard from "../components/BookCard";
import Loading from "./Loading";

const LIMIT = 12;
const MIN_QUERY_LENGTH = 3;

function BookSearch() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loaderRef = useRef(null);
  const intersection = useIntersection(loaderRef, {
    root: null,
    threshold: 1,
  });

  useDebounce(
    () => {
      const normalizedQuery = query.trim();

      if (normalizedQuery.length < MIN_QUERY_LENGTH || !hasMore) return;

      setLoading(true);

      fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(
          normalizedQuery,
        )}&page=${page}&limit=${LIMIT}`,
      )
        .then((res) => {
          if (!res.ok) throw new Error("Bad response");
          return res.json();
        })
        .then((data) => {
          if (!Array.isArray(data.docs)) {
            setHasMore(false);
            setQuery("");
            return;
          }

          setBooks((prev) =>
            page === 1 ? data.docs : [...prev, ...data.docs],
          );

          if (data.docs.length < LIMIT) {
            setHasMore(false);
          }
        })
        .catch(() => {
          setHasMore(false);
        })
        .finally(() => setLoading(false));
    },
    600,
    [query, page],
  );

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

  const onChange = (e) => {
    const value = e.target.value;

    setQuery(value);
    setPage(1);
    setBooks([]);
    setHasMore(true);
  };

  return (
    <>
      <div className="flex justify-around items-center mt-10 mb-15">
        <h2 className="text-xl font-bold">Search Books</h2>
        <div className="search">
          <div className="relative flex items-center">
            <img
              src="icon-search.png"
              alt="search"
              className="absolute left-2 h-5 w-5"
            />
            <input
              type="text"
              value={query}
              onChange={onChange}
              placeholder="Search by title, author, keyword..."
            />
          </div>
        </div>
      </div>
      <div>
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {books.map((book) => (
            <BookCard
              key={book.key}
              book={{ ...book, cover_id: book.cover_i }}
            />
          ))}
        </div>

        {loading && <Loading />}
        <div ref={loaderRef} className="h-10" />
      </div>
    </>
  );
}

export default BookSearch;
