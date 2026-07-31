import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";

function RouteError() {
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Something went wrong.";

  return (
    <div className="text-center mt-10">
      <h2>Something went wrong</h2>
      <p className="text-gray-400 mt-2">{message}</p>
      <Link to="/" className="text-amber-400 mt-4 inline-block">
        Back to home
      </Link>
    </div>
  );
}

export default RouteError;
