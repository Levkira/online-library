import { useDocumentTitle } from "../hooks/useDocumentTitle";
import BookSearch from "./BookSearch";
import BooksCategory from "./BooksCategory";

function Home() {
  useDocumentTitle();

  return (
    <div className="space-y-12">
      <BookSearch />
      <BooksCategory />
    </div>
  );
}

export default Home;
