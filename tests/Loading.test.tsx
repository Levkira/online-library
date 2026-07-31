import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Loading from "../src/components/Loading";

describe("Loading", () => {
  it("renders a status role with an accessible label", () => {
    render(<Loading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("applies extra className passed via props", () => {
    render(<Loading className="mt-6" />);
    expect(screen.getByRole("status")).toHaveClass("mt-6");
  });

  it("uses valid SVG fill values on every path (regression test)", () => {
    const { container } = render(<Loading />);
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBeGreaterThan(0);

    const validFills = new Set(["currentColor", "none"]);
    paths.forEach((path) => {
      const fill = path.getAttribute("fill");
      expect(fill && validFills.has(fill)).toBe(true);
    });
  });
});
