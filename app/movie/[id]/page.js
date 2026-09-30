import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowLeft, Play, Star } from "lucide-react";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import Reveal from "../../components/Reveal";
import { tmdbFetch, describeError } from "../../../lib/tmdb";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";
const TMDB_LOGO_BASE = "https://image.tmdb.org/t/p/original";

async function getMovieDetails(id) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("Missing TMDB_API_KEY in .env.local");
  }
  const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=en-US&include_image_language=en,null&append_to_response=videos,images`;
  const res = await tmdbFetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TMDB error ${res.status}: ${text}`);
  }
  return res.json();
}

function formatRuntime(mins) {
  if (!mins && mins !== 0) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function pickLogo(images) {
  const logos = images?.logos || [];
  if (!logos.length) return null;
  return [...logos].sort((a, b) => (b.width || 0) - (a.width || 0))[0];
}

function pickTrailer(videos) {
  const list = videos?.results || [];
  const official = list.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official);
  if (official) return official;
  return list.find((v) => v.site === "YouTube" && v.type === "Trailer") || null;
}

export default async function MovieDetailsPage({ params }) {
  const { id } = await params;
  let data;
  try {
    data = await getMovieDetails(id);
  } catch (e) {
    return (
      <div className="min-h-[100dvh]">
        <SiteHeader />
        <main className="mx-auto w-full max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10">
          <div className="border border-accent/50 bg-surface-raised p-6">
            <p className="display text-xl">Could not load movie details</p>
            <p className="mt-2 text-sm text-ink-dim">{describeError(e)}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/movie/${id}`}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-[#0a0a0c] transition hover:brightness-105 active:scale-[0.98]"
              >
                Try again
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm text-ink transition hover:border-accent active:scale-[0.98]"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                All films
              </Link>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const title = data.title || data.name || "Movie";
  const year = data.release_date ? new Date(data.release_date).getFullYear() : null;
  const runtime = formatRuntime(data.runtime);
  const rating = typeof data.vote_average === "number" ? data.vote_average.toFixed(1) : "N/A";
  const genreList = (data.genres || []).map((g) => g.name).filter(Boolean);
  const poster = data.poster_path ? `${TMDB_IMAGE_BASE}${data.poster_path}` : null;
  const backdrop = data.backdrop_path ? `${TMDB_BACKDROP_BASE}${data.backdrop_path}` : null;
  const trailer = pickTrailer(data.videos);
  const logo = pickLogo(data.images);
  const logoSrc = logo?.file_path ? `${TMDB_LOGO_BASE}${logo.file_path}` : null;

  return (
    <div className="min-h-[100dvh]">
      <SiteHeader />

      <section className="relative aspect-video w-full overflow-hidden bg-surface-sunken">
        {backdrop ? (
          <Image
            src={backdrop}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        ) : null}

        <div className="absolute bottom-4 left-4 max-w-[65%] sm:bottom-6 sm:left-6 sm:max-w-[34%]">
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt={`${title} logo`}
              width={logo?.width || 600}
              height={logo?.height || 200}
              priority
              sizes="(max-width: 640px) 65vw, 34vw"
              className="h-auto w-full drop-shadow-[0_14px_34px_rgba(0,0,0,0.55)]"
            />
          ) : (
            <p className="display text-xl leading-[1.1] text-white drop-shadow-[0_14px_34px_rgba(0,0,0,0.55)] sm:text-3xl">
              {title}
            </p>
          )}
        </div>

        <Link
          href="/"
          className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/45 px-4 py-2 text-sm text-white backdrop-blur-sm transition hover:bg-black/65 active:scale-[0.98] sm:left-6 sm:top-6"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          All films
        </Link>
      </section>

      <main className="mx-auto w-full max-w-[1400px] px-4 pb-24 sm:px-6 lg:px-10">
        <div className="relative mt-8 grid gap-8 sm:mt-12 md:grid-cols-[220px_1fr] lg:grid-cols-[268px_1fr] lg:gap-12">
          <aside className="w-40 sm:w-52 md:w-full md:sticky md:top-28 md:self-start">
            {poster ? (
              <figure>
                <Image
                  src={poster}
                  alt={`${title} poster`}
                  width={500}
                  height={750}
                  priority
                  className="w-full ring-1 ring-line shadow-[0_30px_70px_-35px_rgb(19_19_22/0.75)]"
                />
                <figcaption className="slate mt-3 hidden text-ink-faint md:block">
                  Theatrical poster
                </figcaption>
              </figure>
            ) : null}
          </aside>

          <Reveal className="min-w-0 pt-1 md:pt-2">
            <div className="slate flex flex-wrap items-center gap-x-3 gap-y-2 text-ink-faint">
              <span className="text-ink-dim">{year ?? "TBA"}</span>
              <span className="h-3 w-px bg-line-strong" aria-hidden="true" />
              {runtime ? (
                <>
                  <span className="text-ink-dim">{runtime}</span>
                  <span className="h-3 w-px bg-line-strong" aria-hidden="true" />
                </>
              ) : null}
              <span className="inline-flex items-center gap-1.5 text-ink">
                <Star
                  className="h-3.5 w-3.5 text-accent"
                  fill="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span className="tabular-nums">{rating}</span>
                <span className="text-ink-faint">/10</span>
              </span>
            </div>

            <span className="mt-7 block h-1 w-12 bg-accent" aria-hidden="true" />

            <h1 className="display mt-5 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              {title}
            </h1>

            {genreList.length ? (
              <ul className="slate mt-5 flex flex-wrap gap-x-5 gap-y-2 text-ink-faint">
                {genreList.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              {trailer ? (
                <a
                  href="#trailer"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-[#0a0a0c] transition hover:brightness-105 active:scale-[0.98]"
                >
                  <Play className="h-4 w-4" fill="currentColor" strokeWidth={1.5} aria-hidden="true" />
                  Watch trailer
                </a>
              ) : null}
              <a
                href="#story"
                className="group inline-flex items-center gap-1.5 text-sm text-ink-dim transition-colors hover:text-ink"
              >
                Read the story
                <ArrowDown
                  className="h-4 w-4 transition-transform group-hover:translate-y-0.5"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </a>
            </div>

            <section id="story" className="mt-14 scroll-mt-28 border-t border-line pt-8">
              <div className="flex items-center gap-4">
                <span className="slate text-accent-ink">01</span>
                <h2 className="display text-lg sm:text-xl">Story</h2>
                <span className="h-px flex-1 bg-line" aria-hidden="true" />
              </div>
              <p className="mt-5 max-w-[65ch] whitespace-pre-wrap text-sm leading-7 text-ink-dim sm:text-base">
                {data.overview || "No story available for this title."}
              </p>
            </section>
          </Reveal>
        </div>

        <Reveal className="mt-16 border-t border-line pt-10" delay={0.05}>
          <div className="flex items-center gap-4">
            <span className="slate text-accent-ink">02</span>
            <h2 className="display text-lg sm:text-xl">Trailer</h2>
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
          </div>
          <div className="mt-6">
            {trailer ? (
              <div
                id="trailer"
                className="aspect-video w-full scroll-mt-28 overflow-hidden bg-black ring-1 ring-line"
              >
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  title={`Trailer: ${title}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            ) : (
              <p className="text-sm text-ink-dim">No trailer available.</p>
            )}
          </div>
        </Reveal>
      </main>

      <SiteFooter />
    </div>
  );
}
