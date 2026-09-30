import Link from "next/link";
import { X } from "lucide-react";
import SiteHeader from "./components/SiteHeader";
import MovieHero from "./components/MovieHero";
import PosterCard from "./components/PosterCard";
import SiteFooter from "./components/SiteFooter";
import { tmdbFetch, describeError } from "../lib/tmdb";

async function getGenres() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return [];
  try {
    const res = await tmdbFetch(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`,
      { next: { revalidate: 86400 } }
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
      const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${encodeURIComponent(
        query
      )}&page=1&include_adult=false`;
      const res = await tmdbFetch(url, { next: { revalidate: 60 } });
      if (!res.ok) throw new Error("Failed to fetch search results");
      const data = await res.json();

      const filtered = applyClientFilters(data.results ?? [], { genreId, year, minRating });
      return { results: filtered };
    }

    if (hasFilters) {
      const params = new URLSearchParams({
        language: "en-US",
        sort_by: "popularity.desc",
        page: "1",
        include_adult: "false",
      });
      if (genreId) params.set("with_genres", String(genreId));
      if (year) params.set("primary_release_year", String(year));
      if (typeof minRating === "number" && !Number.isNaN(minRating) && minRating > 0) {
        params.set("vote_average.gte", String(minRating));
      }
      const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&${params.toString()}`;
      const res = await tmdbFetch(url, { next: { revalidate: 60 } });
      if (!res.ok) throw new Error("Failed to fetch discover movies");
      const data = await res.json();
      return { results: data.results ?? [] };
    }

    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Failed to fetch popular movies");
    const data = await res.json();
    return { results: data.results ?? [] };
  } catch (e) {
    return { results: [], error: describeError(e) };
  }
}

function buildHref(base, overrides) {
  const params = new URLSearchParams();
  const merged = { ...base, ...overrides };
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export default async function Home({ searchParams }) {
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
  const minRating = minRatingParam && Number(minRatingParam) > 0 ? Number(minRatingParam) : null;

  const [{ results: movies, error }, genres] = await Promise.all([
    getMovies({ query: q, genreId, year, minRating }),
    getGenres(),
  ]);

  const genreNames = Object.fromEntries((genres || []).map((g) => [g.id, g.name]));
  const filterState = { q, genre: genreParam, year: yearParam, minRating: minRatingParam };

  const chips = [];
  if (genreId) chips.push({ key: "genre", label: genreNames[genreId] || "Genre" });
  if (year) chips.push({ key: "year", label: String(year) });
  if (minRating) chips.push({ key: "minRating", label: `${minRating}+ rating` });

  const showHero = !q && chips.length === 0 && !error && Boolean(movies[0]?.backdrop_path);
  const gridMovies = showHero ? movies.slice(1) : movies;
  const Heading = showHero ? "h2" : "h1";

  return (
    <div className="min-h-[100dvh]">
      <SiteHeader
        q={q}
        genres={genres}
        genreParam={genreParam}
        yearParam={yearParam}
        minRatingParam={minRatingParam}
      />

      {showHero ? <MovieHero movie={movies[0]} genreNames={genreNames} /> : null}

      <main className="mx-auto w-full max-w-[1400px] px-4 pb-24 pt-10 sm:px-6 sm:pt-14 lg:px-10">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <Heading className="display text-3xl sm:text-4xl lg:text-5xl">
            {q ? "Search results" : "Popular Movies"}
          </Heading>
          {!error && movies.length > 0 ? (
            <span className="slate text-ink-faint">
              {movies.length} {movies.length === 1 ? "film" : "films"}
            </span>
          ) : null}
        </div>

        {error ? (
          <div className="mt-8 border border-accent/50 bg-surface-raised p-5 sm:p-6">
            <p className="display text-xl">Could not load movies</p>
            <p className="mt-2 text-sm text-ink-dim">{error}</p>
            {!process.env.TMDB_API_KEY ? (
              <p className="mt-3 text-sm text-ink-dim">
                Create a .env.local file at the project root with TMDB_API_KEY=YOUR_KEY
              </p>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={buildHref(filterState, {})}
                className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-[#0a0a0c] transition hover:brightness-105 active:scale-[0.98]"
              >
                Try again
              </Link>
              <Link
                href="/"
                className="inline-flex items-center rounded-full border border-line px-5 py-2.5 text-sm text-ink transition hover:border-accent active:scale-[0.98]"
              >
                Reset
              </Link>
            </div>
          </div>
        ) : null}

        {q ? (
          <p className="mt-3 text-sm text-ink-dim">
            Showing results for{" "}
            <span className="font-medium text-ink">&quot;{q}&quot;</span>
          </p>
        ) : null}

        {chips.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <Link
                key={chip.key}
                href={buildHref(filterState, { [chip.key]: "" })}
                aria-label={`Remove ${chip.label} filter`}
                className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface-raised py-1.5 pl-3.5 pr-2.5 text-xs text-ink-dim transition hover:border-accent hover:text-ink"
              >
                {chip.label}
                <X
                  className="h-3.5 w-3.5 text-ink-faint transition group-hover:text-accent-ink"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </Link>
            ))}
            <Link
              href={buildHref({ q }, { genre: "", year: "", minRating: "" })}
              className="inline-flex items-center rounded-full px-3 py-1.5 text-xs text-ink-faint underline-offset-4 transition hover:text-ink hover:underline"
            >
              Clear all
            </Link>
          </div>
        ) : null}

        {!error ? (
          <div className="mt-9">
          {movies.length === 0 && !error ? (
            <div className="border border-line bg-surface-raised px-6 py-16 text-center">
              <p className="display text-2xl sm:text-3xl">No films found</p>
              <p className="mx-auto mt-3 max-w-[46ch] text-sm leading-relaxed text-ink-dim">
                {q
                  ? `Nothing matched "${q}". Try another title, or remove a filter.`
                  : "Nothing matched these filters. Try another genre, year, or rating."}
              </p>
              <Link
                href={q ? buildHref({}, { q: "" }) : "/"}
                className="mt-7 inline-flex items-center rounded-full border border-line px-5 py-2.5 text-sm text-ink transition hover:border-accent active:scale-[0.98]"
              >
                {q ? "Clear search" : "Reset filters"}
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 xl:grid-cols-5">
              {gridMovies.map((m, i) => (
                <PosterCard key={m.id} movie={m} index={i} />
              ))}
            </ul>
            )}
          </div>
        ) : null}
      </main>

      <SiteFooter />
    </div>
  );
}
