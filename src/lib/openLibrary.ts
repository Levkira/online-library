export interface Book {
  key: string;
  title: string;
  coverId?: number;
  authorNames: string[];
}

export interface WorkDetails {
  title: string;
  description?: string;
  covers?: number[];
  subjects?: string[];
}

interface PagedResult {
  books: Book[];
  hasMore: boolean;
}

const BASE_URL = "https://openlibrary.org";

interface SearchDoc {
  key: string;
  title: string;
  cover_i?: number;
  author_name?: string[];
}

interface SubjectWork {
  key: string;
  title: string;
  cover_id?: number;
  authors?: { name: string }[];
}

function normalizeSearchDoc(doc: SearchDoc): Book {
  return {
    key: doc.key,
    title: doc.title,
    coverId: doc.cover_i,
    authorNames: doc.author_name ?? [],
  };
}

function normalizeSubjectWork(work: SubjectWork): Book {
  return {
    key: work.key,
    title: work.title,
    coverId: work.cover_id,
    authorNames: (work.authors ?? []).map((a) => a.name),
  };
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 429) {
      return "Open Library is rate-limiting requests right now — please wait a moment and try again.";
    }
    if (err.status === 404) {
      return "Nothing found.";
    }
    if (err.status >= 500) {
      return "Open Library is having trouble right now. Please try again shortly.";
    }
  }
  if (err instanceof TypeError) {
    return "Network error — check your connection and try again.";
  }
  return "Something went wrong. Please try again.";
}

const MAX_CACHE_ENTRIES = 200;
const responseCache = new Map<string, unknown>();

function cacheGet<T>(url: string): T | undefined {
  return responseCache.get(url) as T | undefined;
}

function cacheSet(url: string, data: unknown): void {
  if (!responseCache.has(url) && responseCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey !== undefined) {
      responseCache.delete(oldestKey);
    }
  }
  responseCache.set(url, data);
}

export function clearResponseCache(): void {
  responseCache.clear();
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const cached = cacheGet<T>(url);
  if (cached !== undefined) {
    return cached;
  }

  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new ApiError(
      `Request to ${url} failed with status ${res.status}`,
      res.status,
    );
  }
  const data = (await res.json()) as T;
  cacheSet(url, data);
  return data;
}

export function appendUniqueBooks(existing: Book[], incoming: Book[]): Book[] {
  const seen = new Set(existing.map((b) => b.key));
  const deduped: Book[] = [];
  for (const book of incoming) {
    if (seen.has(book.key)) continue;
    seen.add(book.key);
    deduped.push(book);
  }
  return [...existing, ...deduped];
}

export async function searchBooks(
  query: string,
  page: number,
  limit: number,
  signal?: AbortSignal,
): Promise<PagedResult> {
  const url = `${BASE_URL}/search.json?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
  const data = await fetchJson<{ docs?: SearchDoc[] }>(url, signal);

  if (!Array.isArray(data.docs)) {
    return { books: [], hasMore: false };
  }

  return {
    books: data.docs.map(normalizeSearchDoc),
    hasMore: data.docs.length >= limit,
  };
}

export async function fetchSubjectBooks(
  subject: string,
  page: number,
  limit: number,
  signal?: AbortSignal,
): Promise<PagedResult> {
  const url = `${BASE_URL}/subjects/${subject}.json?limit=${limit}&offset=${page * limit}`;
  const data = await fetchJson<{ works?: SubjectWork[] }>(url, signal);
  const works = Array.isArray(data.works) ? data.works : [];

  return {
    books: works.map(normalizeSubjectWork),
    hasMore: works.length >= limit,
  };
}

export async function fetchWorkDetails(
  workId: string,
  signal?: AbortSignal,
): Promise<WorkDetails> {
  const url = `${BASE_URL}/works/${workId}.json`;
  const data = await fetchJson<{
    title: string;
    description?: string | { value: string };
    covers?: number[];
    subjects?: string[];
  }>(url, signal);

  return {
    title: data.title,
    description:
      typeof data.description === "string"
        ? data.description
        : data.description?.value,
    covers: data.covers,
    subjects: data.subjects,
  };
}
