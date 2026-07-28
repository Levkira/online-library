import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useIntersection } from "react-use";
import BookGrid from "../components/BookGrid";
import Loading from "../components/Loading";
import { fetchSubjectBooks, type Book } from "../lib/openLibrary";

const LIMIT = 20;

const SUBJECTS = [
  { value: "fantasy", label: "Fantasy" },
  { value: "science_fiction", label: "Sci-Fi" },
  { value: "romance", label: "Romance" },
  { value: "mystery", label: "Mystery" },
  { value: "history", label: "History" },
  { value: "children", label: "Children" },
] as const;

function BooksCategory() {
  const [subject, setSubject] = useState<string>("fantasy");
  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const hasTriggeredRef = useRef(false);
  const intersection = useIntersection(loaderRef, {
    root: null,
    threshold: 1,
  });

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchSubjectBooks(subject, page, LIMIT, controller.signal)
      .then(({ books: newBooks }) => {
        setBooks((prev) => (page === 0 ? newBooks : [...prev, ...newBooks]));
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Couldn't load books right now. Please try again.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [subject, page]);

  useEffect(() => {
    if (intersection?.isIntersecting && !loading && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      setPage((p) => p + 1);
    } else if (!intersection?.isIntersecting) {
      hasTriggeredRef.current = false;
    }
  }, [intersection, loading]);

  const onChangeSubject = (e: ChangeEvent<HTMLSelectElement>) => {
    setSubject(e.target.value);
    setPage(0);
    setBooks([]);
  };

  return (
    <div>
      <h2 className="mb-5 text-center">All Books</h2>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold capitalize">
          {subject.replace("_", " ")} Books
        </h2>

        <label className="sr-only" htmlFor="subject-select">
          Choose a book category
        </label>
        <select
          id="subject-select"
          name={subject}
          value={subject}
          onChange={onChangeSubject}
          className="border rounded-lg px-4 py-2 bg-light-200/10 text-light-100"
        >
          {SUBJECTS.map(({ value, label }) => (
            <option
              key={value}
              className="bg-primary text-light-100"
              value={value}
            >
              {label}
            </option>
          ))}
        </select>
      </div>

      <BookGrid books={books} />

      {error && <p className="text-center text-red-400 mt-4">{error}</p>}
      {loading && <Loading className="mt-6" />}

      <div ref={loaderRef} className="h-10" />
    </div>
  );
}

export default BooksCategory;
