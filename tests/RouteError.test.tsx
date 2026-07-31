import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import RouteError from "../src/components/RouteError";

function ThrowingComponent(): never {
  throw new Error("Something exploded");
}

function renderWithRouterError() {
  const router = createMemoryRouter(
    [
      {
        path: "/",
        element: <ThrowingComponent />,
        errorElement: <RouteError />,
      },
    ],
    { initialEntries: ["/"] },
  );

  return render(<RouterProvider router={router} />);
}

describe("RouteError", () => {
  it("renders a fallback UI and the thrown error's message", () => {
    renderWithRouterError();

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Something exploded")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to home/i })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
