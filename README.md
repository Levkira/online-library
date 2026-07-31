# FindBooks

A fast, minimal book discovery app built on the [Open Library](https://openlibrary.org/developers/api) API. Search by title, author, or keyword, browse curated subject categories, and save favorites — all without a backend of your own.

## Features

- **Search** — debounced, infinite-scrolling search across Open Library's full catalog
- **Browse by category** — Fantasy, Sci-Fi, Romance, Mystery, History, and Children's books, each with infinite scroll
- **Favorites** — save books locally; favorites persist across sessions via `localStorage`
- **Book details** — cover art, description, and subject tags for any work
- **Resilient by default** — request caching, graceful cover-image fallbacks, and specific error messaging (e.g. rate limiting vs. network failure)

## Tech stack

| Layer | Choice |
|---|---|
| Build tool | [Vite](https://vitejs.dev/) |
| UI | [React 19](https://react.dev/) + TypeScript |
| Routing | [react-router-dom](https://reactrouter.com/) (data router, `createHashRouter`) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Data | [Open Library REST API](https://openlibrary.org/developers/api) (no auth required) |
| Testing | [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/react) |
| Utilities | [react-use](https://github.com/streamich/react-use) (`useIntersection`, `useDebounce`) |

No API keys, `.env` file, or backend server are required — the app talks to Open Library's public API directly from the browser.

## Getting started

### Prerequisites

- Node.js 18+
- npm (or your package manager of choice)

### Install

```bash
npm install
```

### Run in development

```bash
npm run dev
```

The app will be available at the URL Vite prints (typically `http://localhost:5173`).

### Build for production

```bash
npm run build
npm run preview   # serve the production build locally
```

### Run tests

```bash
npm test          # single run
npm run test:watch # watch mode
```

See [`tests/README.md`](./tests/README.md) for details on the test setup (Vitest config, jsdom, `IntersectionObserver` stubbing, etc.).

## Project structure

```
src/
├── App.tsx                    # Router setup (createHashRouter + errorElement)
├── main.tsx                   # App entry point, wraps App in FavoritesProvider
├── index.css                  # Tailwind config + global styles
│
├── components/
│   ├── Layout.tsx              # Shared header/nav shell (Outlet-based)
│   ├── BookCard.tsx            # Single book card: cover, title, favorite toggle
│   ├── BookGrid.tsx            # Responsive grid of BookCards
│   ├── Loading.tsx             # Spinner
│   └── RouteError.tsx          # Fallback UI for route-level errors
│
├── pages/
│   ├── Home.tsx                 # Composes BookSearch + BooksCategory
│   ├── BookSearch.tsx           # Debounced search with infinite scroll
│   ├── BooksCategory.tsx        # Subject browser with infinite scroll
│   ├── BookDetails.tsx          # Single work's detail page
│   ├── Favorites.tsx            # Saved books
│   └── NotFound.tsx             # 404 page
│
├── context/
│   └── FavoritesContext.tsx     # React context wrapping the favorites hook
│
├── hooks/
│   ├── useFavorites.ts          # localStorage-backed favorites state
│   └── useDocumentTitle.ts      # Sets document.title per route
│
└── lib/
    └── openLibrary.ts           # Open Library API client, caching, error handling
```

## Architecture notes

- **Data fetching** lives entirely in `lib/openLibrary.ts`. It normalizes Open Library's two differently-shaped response formats (`/search.json` and `/subjects/:id.json`) into a single `Book` type, caches successful responses in memory by URL, and classifies errors (`ApiError` with status code, network `TypeError`, or abort) into user-facing messages via `getErrorMessage()`.
- **Pagination** on both `BookSearch` and `BooksCategory` is triggered by an `IntersectionObserver` sentinel element at the bottom of the grid (via `react-use`'s `useIntersection`). Appended pages are deduplicated against already-loaded books with `appendUniqueBooks()`, since Open Library's search ranking can shift slightly between adjacent pages.
- **Search debouncing** only delays the *typed query* (600ms) — pagination fetches run immediately once triggered by scroll, so "load more" never has an artificial stall.
- **Favorites** are stored under a single `favorites` key in `localStorage`, validated at load time against a runtime type guard so corrupted or unexpected data can't crash the app.
- **Routing** uses React Router's data router (`createHashRouter` + `RouterProvider`) specifically so `errorElement` can catch unexpected render errors per-route and show `RouteError` instead of a blank page.

## Known limitations

- Open Library's public API has no official SLA and can rate-limit aggressively; the app surfaces this as a friendly message but does not currently retry with backoff.
- The in-memory response cache is per-session (cleared on reload) — there's no persistent HTTP cache layer.
- Cover images are served directly from Open Library's CDN (`covers.openlibrary.org`); a missing cover falls back to a placeholder rather than retrying.

