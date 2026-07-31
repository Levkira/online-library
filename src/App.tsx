import { createHashRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import RouteError from "./components/RouteError";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import BookDetails from "./pages/BookDetails";
import NotFound from "./pages/NotFound";

const router = createHashRouter([
  {
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/favorites", element: <Favorites /> },
      { path: "/works/:workId", element: <BookDetails /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
