
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

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
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
