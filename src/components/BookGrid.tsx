import BookCard from "./BookCard";
import type { Book } from "../lib/openLibrary";

interface BookGridProps {
  books: Book[];
}

function BookGrid({ books }: BookGridProps) {
  return (
    <div className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {books.map((book) => (
        <BookCard key={book.key} book={book} />
      ))}
    </div>
  );
}

export default BookGrid;
