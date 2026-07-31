import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import {
  fetchWorkDetails,
  getErrorMessage,
  isAbortError,
  type WorkDetails,
} from "../lib/openLibrary";

function BookDetails() {
  const { workId } = useParams<{ workId: string }>();
  const [book, setBook] = useState<WorkDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [coverFailed, setCoverFailed] = useState(false);

  useDocumentTitle(book?.title);

  useEffect(() => {
    if (!workId) return;

    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard
    setLoading(true);
    setErrorMessage(null);
    setCoverFailed(false);

    fetchWorkDetails(workId, controller.signal)
      .then(setBook)
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setErrorMessage(getErrorMessage(err));
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [workId]);

  if (loading) {
    return <Loading className="text-center" />;
  }

  if (errorMessage || !book) {
    return (
      <div className="text-center mt-5">
        <p className="text-white">{errorMessage ?? "Book not found"}</p>
        <Link to="/" className="text-amber-400 mt-2 inline-block">
          Back to home
        </Link>
      </div>
    );
  }

  const coverId = book.covers?.find((id) => id > 0);
  const showCover = Boolean(coverId) && !coverFailed;

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/" className="text-amber-400 mb-4 inline-block">
        ← Back
      </Link>

      {showCover ? (
        <img
          src={`https://covers.openlibrary.org/b/id/${coverId}-L.jpg`}
          alt={book.title}
          className="w-48 mx-auto mb-6 rounded-md shadow-lg"
          onError={() => setCoverFailed(true)}
        />
      ) : (
        <div className="w-48 h-64 mx-auto mb-6 rounded-md bg-gray-200 flex items-center justify-center text-sm">
          No Cover
        </div>
      )}

      <h2 className="mb-4">{book.title}</h2>

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
