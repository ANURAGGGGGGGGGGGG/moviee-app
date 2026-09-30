# Screenly

A modern Next.js movie explorer powered by the TMDB API. Browse popular films, open a full detail page with the title logo and trailer, and filter by genre, year, and rating — in a fast, responsive, dark-friendly UI.

## Features

### Home
- Featured film hero with backdrop, meta, blurb, and a "View film" CTA
- Responsive poster grid with pointer-tilt hover on each card
- Filters panel: genre, year, and minimum-rating slider (URL-driven, shareable)
- Search with query params, plus a composed "no results" state
- Skeleton loaders shaped like the real grid

### Film detail (`/movie/[id]`)
- Full 16:9 backdrop hero with zero cropping and a small TMDB title-logo overlay (falls back to the film title when no logo exists)
- "All films" back button pinned to the hero
- Sticky poster column with a "Theatrical poster" caption
- Editorial meta strip (year · runtime · ★ rating with tabular figures), accent rule, and a large display title
- Genre list, "Watch trailer" CTA, and a "Read the story" jump link
- Numbered `01 / Story` and `02 / Trailer` sections with hairline rules
- Embedded YouTube trailer (official trailer preferred, any trailer as fallback)
- Route-level loading skeletons and a friendly error state with retry

### Platform
- App Router with server components, streaming, and route-level `loading.js`
- Image optimization for TMDB posters, backdrops, and logos
- Lenis smooth scrolling, staggered reveal animations, fixed film-grain overlay
- Respects `prefers-reduced-motion`
- Light and dark themes driven by `prefers-color-scheme`
- TMDB fetches retry with exponential backoff and surface readable network errors

## Tech Stack

- Next.js 15 (App Router) · React 19
- Tailwind CSS v4 (tokens in `app/globals.css`)
- `motion` (Framer Motion) · Lenis · lucide-react
- TMDB API

## Design System

Defined in `app/globals.css`:

- **Type** — Archivo Black for display headlines (`display`), Geist Sans body, Geist Mono for uppercase letter-spaced metadata (`slate`)
- **Color** — neutral surface/ink scale with a single amber accent (`--accent`), light values in `:root`, dark values under `prefers-color-scheme`
- **Texture** — fixed `.grain` overlay, `.skeleton` shimmer loaders, hairline `--line` borders

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` and add your TMDB API key:

   ```bash
   TMDB_API_KEY=your_tmdb_api_key
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Build and run production:

   ```bash
   npm run build
   npm start
   ```

## Project Structure

- `app/` — routes, layouts, pages (App Router)
- `app/page.js` — home: hero, filters, poster grid
- `app/movie/[id]/` — film detail page and its loading skeleton
- `app/components/` — SiteHeader, SiteFooter, MovieHero, PosterCard, FilterPanel, Reveal, LenisProvider
- `app/globals.css` — Tailwind v4 theme tokens and shared UI helpers
- `lib/tmdb.js` — TMDB fetch with retries and error descriptions
- `lib/utils.js` — small utilities
- `public/` — icons and manifest

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — create a production build
- `npm start` — run the production server
- `npm run lint` — lint the project

## Configuration

- Images are allowed from TMDB (`next.config.mjs`, `image.tmdb.org/t/p/**`)
- Required env var: `TMDB_API_KEY`
- Home data is fetched server-side with ISR revalidation (movies every minute, genres daily); film details revalidate hourly

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.

## License

MIT — see LICENSE for details.
