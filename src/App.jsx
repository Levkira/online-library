import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import BookSearch from "./components/BookSearch";
import BooksCategory from "./components/BooksCategory";
import Favorites from "./components/Favorites";
import BookDetails from "./components/BookDetails";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <BookSearch />
                <BooksCategory />
              </>
            }
          />

          <Route path="/favorites" element={<Favorites />} />
          <Route path="/works/:workId" element={<BookDetails />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
