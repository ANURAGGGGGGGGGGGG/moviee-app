# Screenly

A modern Next.js movie explorer powered by the TMDB API. Discover trending movies, watch trailers, and filter by genre, year, and rating — all in a fast, responsive UI.

## Features
- Popular/trending movies grid with responsive cards
- Movie detail page: backdrop hero, genres, overview, and trailer picker
- Filters panel with genre, year, and a red-themed minimum-rating slider
- Smooth scrolling and polished dark-friendly design
- App Router, server components, and image optimization

## Tech Stack
- Next.js (App Router)
- React
- Tailwind CSS
- TMDB API

## Getting Started
1. Install dependencies:
   npm install
2. Configure environment variables (create .env.local):
   TMDB_API_KEY=your_tmdb_api_key
3. Run the development server:
   npm run dev
4. Build and start production:
   npm run build
   npm start

## Project Structure
- app/ — routes, layouts, pages (App Router)
- app/components/ — shared UI components (e.g., FilterPanel)
- lib/ — utilities and helpers
- public/ — icons and manifest

## Scripts
- dev: Start the dev server
- build: Create a production build
- start: Run the production server
- lint: Lint the project

## Configuration
- Images are configured to load from TMDB (next.config.mjs)
- Required env var: TMDB_API_KEY

## Attribution
This product uses the TMDB API but is not endorsed or certified by TMDB.

## License
MIT — see LICENSE for details.
