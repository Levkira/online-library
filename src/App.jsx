import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import BookSearch from "./pages/BookSearch";
import BooksCategory from "./pages/BooksCategory";
import Favorites from "./pages/Favorites";
import BookDetails from "./pages/BookDetails";

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
