import { useEffect, useRef, useState } from "react";
import { useIntersection } from "react-use";
import BookCard from "../components/BookCard";
import Loading from "./Loading";

const LIMIT = 20;

function BooksCategory() {
  const [subject, setSubject] = useState("fantasy");
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const loaderRef = useRef(null);
  const intersection = useIntersection(loaderRef, {
    root: null,
    threshold: 1,
  });

  const fetchBooks = async () => {
    setLoading(true);

    fetch(
      `https://openlibrary.org/subjects/${subject}.json?limit=${LIMIT}&offset=${
        page * LIMIT
      }`,
    )
      .then((res) => res.json())
      .then((data) => {
        setBooks((prev) =>
          page === 0 ? data.works : [...prev, ...data.works],
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBooks();
  }, [subject, page]);

  useEffect(() => {
    if (intersection?.isIntersecting && !loading) {
      setPage((p) => p + 1);
    }
  }, [intersection, loading]);

  const onChangeSubject = (e) => {
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

        <select
          name={subject}
          value={subject}
          onChange={onChangeSubject}
          className="border rounded-lg px-4 py-2 bg-light-200/10 text-light-100"
        >
          <option className="bg-primary text-light-100" value="fantasy">
            Fantasy
          </option>
          <option className="bg-primary text-light-100" value="science_fiction">
            Sci-Fi
          </option>
          <option className="bg-primary text-light-100" value="romance">
            Romance
          </option>
          <option className="bg-primary text-light-100" value="mystery">
            Mystery
          </option>
          <option className="bg-primary text-light-100" value="history">
            History
          </option>
          <option className="bg-primary text-light-100" value="children">
            Children
          </option>
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {books.map((book) => (
          <BookCard key={book.key} book={book} />
        ))}
      </div>

      {loading && <Loading className="text-center mt-6" />}

      <div ref={loaderRef} className="h-10" />
    </div>
  );
}

export default BooksCategory;
