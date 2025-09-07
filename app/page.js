import Image from "next/image";
import Link from "next/link";
import FilterPanel from "./components/FilterPanel";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

async function getGenres() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return [];
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`,
      { next: { revalidate: 86400 } } // revalidate once a day
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.genres || [];
  } catch {
    return [];
  }
}

function applyClientFilters(list, { genreId, year, minRating }) {
  let out = list;
  if (genreId) out = out.filter((m) => (m.genre_ids || []).includes(Number(genreId)));
  if (year) out = out.filter((m) => (m.release_date || "").startsWith(String(year)));
  // Only apply rating filter when greater than 0
  if (typeof minRating === "number" && !Number.isNaN(minRating) && minRating > 0) {
    out = out.filter((m) => (m.vote_average || 0) >= minRating);
  }
  return out;
}

async function getMovies({ query, genreId, year, minRating }) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return { results: [], error: "Missing TMDB API key" };
  }

  const hasFilters = Boolean(
    genreId || year || (typeof minRating === "number" && !Number.isNaN(minRating) && minRating > 0)
  );

  try {
    if (query) {
      // 1) search path always for query
      const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${encodeURIComponent(
        query
      )}&page=1&include_adult=false`;
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (!res.ok) throw new Error("Failed to fetch search results");
      const data = await res.json();

      // refine with client filters when combined with query
      const filtered = applyClientFilters(data.results ?? [], { genreId, year, minRating });
      return { results: filtered };
    }

    if (hasFilters) {
      // 2) filters only -> discover
      const params = new URLSearchParams({ language: "en-US", sort_by: "popularity.desc", page: "1", include_adult: "false" });
      if (genreId) params.set("with_genres", String(genreId));
      if (year) params.set("primary_release_year", String(year));
      if (typeof minRating === "number" && !Number.isNaN(minRating) && minRating > 0) {
        params.set("vote_average.gte", String(minRating));
      }
      const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&${params.toString()}`;
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (!res.ok) throw new Error("Failed to fetch discover movies");
      const data = await res.json();
      return { results: data.results ?? [] };
    }

    // 3) default popular
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Failed to fetch popular movies");
    const data = await res.json();
    return { results: data.results ?? [] };
  } catch (e) {
    return { results: [], error: e.message };
  }
}

export default async function Home({ searchParams }) {
  // Next.js 15: searchParams is async; await it and read safely whether it's an object or URLSearchParams-like
  const sp = await searchParams;
  const getParam = (key) => {
    if (!sp) return "";
    if (typeof sp.get === "function") {
      const v = sp.get(key);
      return v ?? "";
    }
    const v = sp[key];
    if (Array.isArray(v)) return v[0] ?? "";
    return v ?? "";
  };

  const q = getParam("q");
  const genreParam = getParam("genre");
  const yearParam = getParam("year");
  const minRatingParam = getParam("minRating");

  const genreId = genreParam ? Number(genreParam) : null;
  const year = yearParam ? Number(yearParam) : null;
  // parse minRating: treat 0 or empty as not set
  const minRating = minRatingParam && Number(minRatingParam) > 0 ? Number(minRatingParam) : null;

  const [{ results: movies, error }, genres] = await Promise.all([
    getMovies({ query: q, genreId, year, minRating }),
    getGenres(),
  ]);

  return (
    <div className="min-h-screen w-full p-6 sm:p-10">
      <header className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              {q ? `Search results` : `Popular Movies`}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {q ? (
                <span>
                  Showing results for <span className="font-medium">&quot;{q}&quot;</span>
                </span>
              ) : (
                "Screenly"
              )}
            </p>
          </div>
          {/* Screenly pill with TMDb attribution popover */}
          <details className="relative hidden sm:block">
            <summary
              className="inline-flex items-center rounded-full border border-black/10 dark:border-white/20 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer list-none"
              aria-label="Screenly (open for TMDb attribution)"
            >
              <span>Documentation</span>
            </summary>
            {/* Popover */}
            <div className="absolute right-0 mt-2 w-[min(90vw,360px)] rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-lg p-3 text-xs text-neutral-700 dark:text-neutral-300 z-10">
              <p className="flex flex-wrap items-center gap-2">
                <span>This Movie App uses the TMDb API but is not endorsed or certified by TMDb.</span>
                <a
                  className="underline hover:no-underline"
                  href="https://developer.themoviedb.org/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  API docs
                </a>
                <span>•</span>
                <a
                  className="underline hover:no-underline"
                  href="https://www.themoviedb.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  TMDb site
                </a>
                <span>•</span>
                <span>Thanks to TMDb for their open API.</span>
              </p>
            </div>
          </details>
        </div>
        {/* documentation from screenly */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Search bar */}
          <form action="/" method="GET" className="w-full sm:w-[520px]">
            {/* Preserve existing filters when searching */}
            {genreParam ? <input type="hidden" name="genre" value={genreParam} /> : null}
            {yearParam ? <input type="hidden" name="year" value={yearParam} /> : null}
            {minRatingParam ? <input type="hidden" name="minRating" value={minRatingParam} /> : null}
            <div className="relative">
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search movies..."
                className="w-full rounded-full border border-black/10 dark:border-white/15 bg-white/60 dark:bg-neutral-900/60 backdrop-blur pl-4 pr-24 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
                aria-label="Search movies"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 rounded-full px-4 text-sm font-medium bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition"
                aria-label="Search"
              >
                Search
              </button>
            </div>
          </form>

          {/* Filters button opens modal */}
          <FilterPanel
            genres={genres}
            q={q}
            initialGenre={genreParam}
            initialYear={yearParam}
            initialMinRating={minRatingParam}
          />
        </div>
        {/* Removed separate Filters container below since it's now inline with search */}
         
       </header>

      {error ? (
        <div className="mb-6 rounded-lg border border-red-300/50 bg-red-50 dark:bg-red-950/20 p-4 text-red-700 dark:text-red-300">
          <p className="font-medium">Could not load movies</p>
          <p className="text-sm opacity-80">{error}</p>
          {!process.env.TMDB_API_KEY && (
            <p className="mt-2 text-sm opacity-80">
              Create a .env.local file at the project root with TMDB_API_KEY=YOUR_KEY
            </p>
          )}
        </div>
      ) : null}

      <main>
        {movies.length === 0 ? (
          <p className="text-neutral-500 dark:text-neutral-400">
            {q ? (
              <span>
                No results found for <span className="font-medium">&quot;{q}&quot;</span>.
              </span>
            ) : (
              "No movies found."
            )}
          </p>
        ) : (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
            {movies.map((m) => {
              const poster = m.poster_path ? `${TMDB_IMAGE_BASE}${m.poster_path}` : null;
              return (
                <li key={m.id} className="group rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-black/10 dark:focus-within:ring-white/20">
                  <Link href={`/movie/${m.id}`} className="block">
                    <div className="relative aspect-[2/3] bg-neutral-100 dark:bg-neutral-800">
                      {poster ? (
                        <Image
                          src={poster}
                          alt={m.title || m.name || "Movie poster"}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 200px"
                          priority={false}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm">No Image</div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem] group-hover:underline">{m.title || m.name}</h3>
                      <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
                        <span>{m.release_date ? new Date(m.release_date).getFullYear() : "—"}</span>
                        <span className="inline-flex items-center gap-1">
                          ⭐ <span>{m.vote_average?.toFixed?.(1) ?? "N/A"}</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
