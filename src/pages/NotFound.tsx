import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="text-center mt-10">
      <h2>Page not found</h2>
      <p className="text-gray-400 mt-2">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link to="/" className="text-amber-400 mt-4 inline-block">
        Back to home
      </Link>
    </div>
  );
}

export default NotFound;
