import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDocumentTitle } from "../src/hooks/useDocumentTitle";

describe("useDocumentTitle", () => {
  it("sets document.title including the site name when given a title", () => {
    renderHook(() => useDocumentTitle("Dune"));
    expect(document.title).toBe("Dune · FindBooks");
  });

  it("falls back to the bare site name when no title is given", () => {
    renderHook(() => useDocumentTitle());
    expect(document.title).toBe("FindBooks");
  });

  it("updates the title when the value changes", () => {
    const { rerender } = renderHook(({ title }) => useDocumentTitle(title), {
      initialProps: { title: "Dune" },
    });
    expect(document.title).toBe("Dune · FindBooks");

    rerender({ title: "The Hobbit" });
    expect(document.title).toBe("The Hobbit · FindBooks");
  });
});
