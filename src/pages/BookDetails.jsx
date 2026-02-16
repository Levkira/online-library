import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loading from "../components/Loading";

function BookDetails() {
  const { workId } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://openlibrary.org/works/${workId}.json`)
      .then((res) => res.json())
      .then(setBook)
      .finally(() => setLoading(false));
  }, [workId]);

  if (loading) {
    return <Loading className="text-center" />;
  }

  if (!book) {
    return <p className="text-center">Book not found</p>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{book.title}</h1>

      {book.description && (
        <p className="text-white">
          {typeof book.description === "string"
            ? book.description
            : book.description.value}
        </p>
      )}
    </div>
  );
}

export default BookDetails;
