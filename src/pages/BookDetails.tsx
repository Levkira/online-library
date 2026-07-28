import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import { fetchWorkDetails, type WorkDetails } from "../lib/openLibrary";

function BookDetails() {
  const { workId } = useParams<{ workId: string }>();
  const [book, setBook] = useState<WorkDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!workId) return;

    const controller = new AbortController();
    setLoading(true);
    setError(false);

    fetchWorkDetails(workId, controller.signal)
      .then(setBook)
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(true);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [workId]);

  if (loading) {
    return <Loading className="text-center" />;
  }

  if (error || !book) {
    return (
      <div className="text-center mt-5">
        <p>Book not found</p>
        <Link to="/" className="text-amber-400 mt-2 inline-block">
          Back to home
        </Link>
      </div>
    );
  }

  const coverId = book.covers?.find((id) => id > 0);

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/" className="text-amber-400 mb-4 inline-block">
        ← Back
      </Link>

      {coverId && (
        <img
          src={`https://covers.openlibrary.org/b/id/${coverId}-L.jpg`}
          alt={book.title}
          className="w-48 mx-auto mb-6 rounded-md shadow-lg"
        />
      )}

      <h1 className="text-2xl font-bold mb-4">{book.title}</h1>

      {book.description && <p className="text-white">{book.description}</p>}

      {book.subjects && book.subjects.length > 0 && (
        <p className="text-gray-400 text-sm mt-4">
          {book.subjects.slice(0, 8).join(", ")}
        </p>
      )}
    </div>
  );
}

export default BookDetails;
