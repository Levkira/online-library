import BookSearch from "./BookSearch";
import BooksCategory from "./BooksCategory";

function Home() {
  return (
    <div className="space-y-12">
      <BookSearch />
      <BooksCategory />
    </div>
  );
}

export default Home;
