import Image from "next/image";
import Link from "next/link";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

async function getMovieDetails(id) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("Missing TMDB_API_KEY in .env.local");
  }
  const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=en-US&append_to_response=videos`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
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

function pickTrailer(videos) {
  const list = videos?.results || [];
  // Prefer an official YouTube trailer if available
  const official = list.find(v => v.site === "YouTube" && v.type === "Trailer" && v.official);
  if (official) return official;
  // Else any YouTube trailer
  return list.find(v => v.site === "YouTube" && v.type === "Trailer") || null;
}

export default async function MovieDetailsPage({ params }) {
  const { id } = params;
  let data;
  try {
    data = await getMovieDetails(id);
  } catch (e) {
    return (
      <div className="min-h-screen p-6 sm:p-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-lg border border-red-300/50 bg-red-50 dark:bg-red-950/20 p-4 text-red-700 dark:text-red-300">
            <p className="font-medium">Could not load movie details</p>
            <p className="text-sm opacity-80">{e instanceof Error ? e.message : String(e)}</p>
          </div>
        </div>
      </div>
    );
  }

  const title = data.title || data.name || "Movie";
  const year = data.release_date ? new Date(data.release_date).getFullYear() : null;
  const runtime = formatRuntime(data.runtime);
  const rating = typeof data.vote_average === "number" ? data.vote_average.toFixed(1) : "N/A";
  const genres = (data.genres || []).map(g => g.name).join(", ");
  const poster = data.poster_path ? `${TMDB_IMAGE_BASE}${data.poster_path}` : null;
  const backdrop = data.backdrop_path ? `${TMDB_BACKDROP_BASE}${data.backdrop_path}` : null;
  const trailer = pickTrailer(data.videos);

  return (
    <div className="min-h-screen w-full">
      {/* Backdrop banner */}
      <div className="relative h-[50vh] md:h-[65vh] w-full overflow-hidden">
        {backdrop ? (
          <Image src={backdrop} alt={`${title} backdrop`} fill className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-900 dark:to-neutral-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10" />
        <Link
          href="/"
          className="absolute top-4 left-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 dark:border-white/20 bg-black/30 text-white hover:bg-black/40 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 30 30"
            className="h-5 w-5"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M 15 2 A 1 1 0 0 0 14.300781 2.2851562 L 3.3925781 11.207031 A 1 1 0 0 0 3.3554688 11.236328 L 3.3183594 11.267578 L 3.3183594 11.269531 A 1 1 0 0 0 3 12 A 1 1 0 0 0 4 13 L 5 13 L 5 24 C 5 25.105 5.895 26 7 26 L 23 26 C 24.105 26 25 25.105 25 24 L 25 13 L 26 13 A 1 1 0 0 0 27 12 A 1 1 0 0 0 26.681641 11.267578 L 26.666016 11.255859 A 1 1 0 0 0 26.597656 11.199219 L 25 9.8925781 L 25 6 C 25 5.448 24.552 5 24 5 L 23 5 C 22.448 5 22 5.448 22 6 L 22 7.4394531 L 15.677734 2.2675781 A 1 1 0 0 0 15 2 z M 18 15 L 22 15 L 22 23 L 18 23 L 18 15 z"></path>
          </svg>
        </Link>
      </div>

      <div className="p-6 sm:p-10">
        <div className="mx-auto max-w-5xl -mt-20 md:-mt-28 relative">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight">
                    {title} {year ? <span className="text-neutral-400 text-xl">({year})</span> : null}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500">
                    {runtime ? <span>{runtime}</span> : null}
                    {genres ? <span>{genres}</span> : null}
                    <span className="inline-flex items-center gap-1">⭐ {rating}</span>
                  </div>
                </div>
                {/* Removed old header-right Home button */}
              </div>

              {/* Story */}
              <section className="mt-6">
                <h2 className="text-lg font-medium mb-2">Story</h2>
                <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                  {data.overview || "No story available for this title."}
                </p>
              </section>

              {/* Trailer */}
              <section className="mt-8">
                <h2 className="text-lg font-medium mb-3">Trailer</h2>
                {trailer ? (
                  <div className="aspect-video w-full rounded-lg overflow-hidden ring-1 ring-black/10 dark:ring-white/10 bg-black">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${trailer.key}`}
                      title={`Trailer: ${title}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">No trailer available.</p>
                )}
              </section>
            </div>
          </div>

          <div className="mt-8">
            {/* Back link removed as requested */}
          </div>
        </div>
      </div>
    </div>
  );
}