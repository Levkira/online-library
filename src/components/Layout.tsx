import { Link, Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="wrapper">
      <header className="mt-5 sm:mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <Link
            to="/"
            className="relative block overflow-hidden rounded-xl shadow-md group"
          >
            <img
              src="./bookshelf.jpg"
              alt="Bookshelf background"
              className="w-full h-48 sm:h-64 md:h-80 object-cover brightness-40 transition-all duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <h1 className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-center text-white text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                <span>Find</span>
                <span className="text-gradient">Books</span>
                <span>For You</span>
              </h1>
            </div>
          </Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-6">
        <Link to="/favorites" className="text-amber-400 flex justify-end">
          ★ Favorites
        </Link>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
