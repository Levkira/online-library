import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFavorites } from "../src/hooks/useFavorites";
import type { Book } from "../src/lib/openLibrary";

const dune: Book = {
  key: "/works/OL1W",
  title: "Dune",
  coverId: 1,
  authorNames: ["Frank Herbert"],
};

const hobbit: Book = {
  key: "/works/OL2W",
  title: "The Hobbit",
  authorNames: ["J.R.R. Tolkien"],
};

describe("useFavorites", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts empty when localStorage is empty", () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
  });

  it("hydrates from localStorage on mount", () => {
    localStorage.setItem("favorites", JSON.stringify([dune]));
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([dune]);
  });

  it("adds a book on toggleFavorite when not already favorited", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => result.current.toggleFavorite(dune));

    expect(result.current.favorites).toEqual([dune]);
    expect(result.current.isFavorite(dune.key)).toBe(true);
  });

  it("removes a book on toggleFavorite when already favorited", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => result.current.toggleFavorite(dune));
    act(() => result.current.toggleFavorite(dune));

    expect(result.current.favorites).toEqual([]);
    expect(result.current.isFavorite(dune.key)).toBe(false);
  });

  it("tracks multiple favorites independently", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => result.current.toggleFavorite(dune));
    act(() => result.current.toggleFavorite(hobbit));

    expect(result.current.favorites).toHaveLength(2);
    expect(result.current.isFavorite(dune.key)).toBe(true);
    expect(result.current.isFavorite(hobbit.key)).toBe(true);

    act(() => result.current.toggleFavorite(dune));
    expect(result.current.favorites).toEqual([hobbit]);
  });

  it("persists favorites to localStorage on change", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => result.current.toggleFavorite(dune));

    const stored = JSON.parse(localStorage.getItem("favorites") ?? "[]");
    expect(stored).toEqual([dune]);
  });

  it("falls back to an empty list when localStorage contains invalid JSON", () => {
    localStorage.setItem("favorites", "{not valid json");
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
  });

  it("does not throw if localStorage.setItem fails", () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("quota exceeded");
      });

    const { result } = renderHook(() => useFavorites());
    expect(() => act(() => result.current.toggleFavorite(dune))).not.toThrow();

    setItemSpy.mockRestore();
  });
});
