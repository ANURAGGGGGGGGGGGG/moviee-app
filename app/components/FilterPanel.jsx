"use client";
import { useState, useMemo } from "react";

export default function FilterPanel({
  genres = [],
  q = "",
  initialGenre = "",
  initialYear = "",
  initialMinRating = "",
}) {
  const [open, setOpen] = useState(false);
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  // live state for min rating display
  const [minRating, setMinRating] = useState(
    initialMinRating !== "" ? Number(initialMinRating) : 0
  );

  const resetHref = useMemo(() => {
    if (q) {
      const params = new URLSearchParams({ q });
      return `/?${params.toString()}`;
    }
    return "/";
  }, [q]);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-full border border-black/10 dark:border-white/20 px-4 py-3 text-sm hover:bg-black/5 dark:hover:bg-white/10 transition"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        Filters
      </button>

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />

          <div className="absolute left-1/2 top-16 -translate-x-1/2 w-[min(92vw,560px)] rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-medium">Filters</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Close filters"
              >
                Close
              </button>
            </div>

            <form action="/" method="GET" className="space-y-4">
              {q && <input type="hidden" name="q" value={q} />}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Genre */}
                <label className="block text-sm">
                  <span className="block mb-1 text-neutral-600 dark:text-neutral-300">Genre</span>
                  <select
                    name="genre"
                    defaultValue={initialGenre || ""}
                    className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-white/60 dark:bg-neutral-900/60 backdrop-blur px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
                  >
                    <option value="">Any</option>
                    {genres.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </label>

                {/* Year */}
                <label className="block text-sm">
                  <span className="block mb-1 text-neutral-600 dark:text-neutral-300">Year</span>
                  <input
                    type="number"
                    name="year"
                    min="1900"
                    max={currentYear}
                    placeholder="Any"
                    defaultValue={initialYear || ""}
                    className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-white/60 dark:bg-neutral-900/60 backdrop-blur px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
                  />
                </label>

                {/* Minimum rating */}
                <label className="block text-sm sm:col-span-2">
                  <span className="block mb-1 text-neutral-600 dark:text-neutral-300">Minimum rating: <span className="font-medium">{minRating}</span></span>
                  <input
                    type="range"
                    name="minRating"
                    min="0"
                    max="10"
                    step="0.5"
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="w-full"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between pt-2">
                <a href={resetHref} className="text-sm text-neutral-600 dark:text-neutral-300 hover:underline">Reset</a>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="rounded-full bg-black text-white dark:bg-white dark:text-black px-5 py-2.5 text-sm font-medium hover:opacity-90 transition"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}