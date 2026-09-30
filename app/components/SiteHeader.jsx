"use client";
import { useState } from "react";
import Link from "next/link";
import { useMotionValueEvent, useScroll } from "motion/react";
import { ArrowRight, Search } from "lucide-react";
import FilterPanel from "./FilterPanel";

export default function SiteHeader({
  q = "",
  genres = [],
  genreParam = "",
  yearParam = "",
  minRatingParam = "",
}) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const next = latest > 16;
    setScrolled((prev) => (prev === next ? prev : next));
  });

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors duration-300 ${
        scrolled ? "border-line bg-surface/85" : "border-transparent bg-surface/60"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:h-[72px] sm:flex-nowrap sm:gap-6 sm:px-6 sm:py-0 lg:px-10">
        <Link
          href="/"
          className="display order-1 shrink-0 text-lg leading-none sm:text-xl"
          aria-label="Screenly, home"
        >
          Screenly
        </Link>

        <form
          action="/"
          method="GET"
          className="order-3 w-full min-w-0 basis-full sm:order-2 sm:ml-auto sm:basis-auto sm:max-w-[420px] sm:flex-1"
        >
          {genreParam ? <input type="hidden" name="genre" value={genreParam} /> : null}
          {yearParam ? <input type="hidden" name="year" value={yearParam} /> : null}
          {minRatingParam ? (
            <input type="hidden" name="minRating" value={minRatingParam} />
          ) : null}
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search movies..."
              aria-label="Search movies"
              className="w-full rounded-full border border-line bg-surface-raised py-2.5 pl-10 pr-11 text-sm text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-accent"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-[#0a0a0c] transition hover:brightness-105 active:scale-95"
            >
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </form>

        <div className="order-2 ml-auto sm:order-3 sm:ml-0">
          {genres.length > 0 ? (
            <FilterPanel
              genres={genres}
              q={q}
              initialGenre={genreParam}
              initialYear={yearParam}
              initialMinRating={minRatingParam}
            />
          ) : null}
        </div>
      </div>
    </header>
  );
}
