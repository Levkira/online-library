import { Link, Outlet } from "react-router-dom";

function Layout({ children }) {
  return (
    <div className="wapper">
      <header className="sm:mt-10 mt-5">
        <div className="max-w-7xl mx-auto px-6 py-4 relative flex justify-center">
          <Link to="/" className="font-bold text-base">
            <img
              src="./bookshelf.jpg"
              alt="Hero Banner"
              className="w-full h-auto object-contain mx-auto drop-shadow-md brightness-30"
            />
            <h1 className="mt-3 absolute inset-0 flex items-center justify-center space-x-4">
              <span>Find</span>
              <span className="text-gradient"> Books</span>
              <span>For You</span>
            </h1>
          </Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-6">
        <Link to="/favorites" className="text-amber-400 flex justify-end ">
          ★ Favorites
        </Link>
        <Outlet />
        {children}
      </main>
    </div>
  );
}

export default Layout;
