"use client";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal, X } from "lucide-react";

export default function FilterPanel({
  genres = [],
  q = "",
  initialGenre = "",
  initialYear = "",
  initialMinRating = "",
}) {
  const [open, setOpen] = useState(false);
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [minRating, setMinRating] = useState(
    initialMinRating !== "" ? Number(initialMinRating) : 0
  );

  const hasActive = Boolean(initialGenre || initialYear || Number(initialMinRating) > 0);

  const resetHref = useMemo(() => {
    if (q) {
      const params = new URLSearchParams({ q });
      return `/?${params.toString()}`;
    }
    return "/";
  }, [q]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const dialog = open
    ? createPortal(
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Filters">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="absolute left-1/2 top-1/2 max-h-[90svh] w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-line bg-surface-raised p-5 shadow-[0_40px_90px_-30px_rgb(19_19_22/0.6)] sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h3 className="display text-xl">Filters</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-dim transition hover:border-line-strong hover:text-ink"
              >
                <X className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>

            <form action="/" method="GET" className="space-y-5">
              {q ? <input type="hidden" name="q" value={q} /> : null}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="slate mb-2.5 block text-ink-dim">Genre</span>
                  <select
                    name="genre"
                    defaultValue={initialGenre || ""}
                    className="w-full rounded-full border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
                  >
                    <option value="">Any</option>
                    {genres.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="slate mb-2.5 block text-ink-dim">Year</span>
                  <input
                    type="number"
                    name="year"
                    min="1900"
                    max={currentYear}
                    placeholder="Any"
                    defaultValue={initialYear || ""}
                    className="w-full rounded-full border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-accent"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="slate mb-3 flex items-center justify-between text-ink-dim">
                    <span>Minimum rating</span>
                    <span className="text-ink">{minRating.toFixed(1)}</span>
                  </span>
                  <input
                    type="range"
                    name="minRating"
                    min="0"
                    max="10"
                    step="0.5"
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    aria-label="Minimum rating"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between border-t border-line pt-5">
                <a
                  href={resetHref}
                  className="text-sm text-ink-dim underline-offset-4 transition hover:text-ink hover:underline"
                >
                  Reset
                </a>
                <button
                  type="submit"
                  className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-[#0a0a0c] transition hover:brightness-105 active:scale-[0.98]"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div className="relative shrink-0 text-left">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition active:scale-[0.98] ${
          hasActive
            ? "border-accent text-accent-ink"
            : "border-line text-ink hover:border-line-strong"
        }`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        Filters
      </button>
      {dialog}
    </div>
  );
}
