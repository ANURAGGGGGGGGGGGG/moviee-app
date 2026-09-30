"use client";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

const TMDB_BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

function trimWords(text, max) {
  const words = (text || "").trim().split(/\s+/);
  if (words.length <= max) return words.join(" ");
  return words.slice(0, max).join(" ") + "...";
}

export default function MovieHero({ movie, genreNames = [] }) {
  const reduce = useReducedMotion();
  const backdrop = movie.backdrop_path ? `${TMDB_BACKDROP_BASE}${movie.backdrop_path}` : null;
  if (!backdrop) return null;

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
  const rating =
    typeof movie.vote_average === "number" && movie.vote_average > 0
      ? movie.vote_average.toFixed(1)
      : null;
  const genres = (movie.genre_ids || [])
    .map((id) => genreNames[id])
    .filter(Boolean)
    .slice(0, 2);
  const blurb = trimWords(movie.overview, 20);

  const meta = [
    year ? String(year) : null,
    genres.length ? genres.join(" / ") : null,
    rating ? `${rating} rating` : null,
  ].filter(Boolean);

  return (
    <motion.section
      aria-label={`Featured film: ${movie.title}`}
      variants={container}
      initial={reduce ? false : "hidden"}
      animate="show"
      className="relative isolate h-[64svh] min-h-[440px] max-h-[720px] w-full overflow-hidden"
    >
      <Image
        src={backdrop}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_28%]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface to-transparent" />

      <div className="relative flex h-full items-end">
        <div className="mx-auto w-full max-w-[1400px] px-4 pb-11 sm:px-6 sm:pb-14 lg:px-10">
          <motion.div
            variants={item}
            className="slate flex flex-wrap items-center gap-x-3 gap-y-2 text-white/85"
          >
            {meta.map((m, i) => (
              <span key={m} className="flex items-center gap-3">
                {i > 0 ? (
                  <span className="h-3 w-px bg-white/35" aria-hidden="true" />
                ) : null}
                {m}
              </span>
            ))}
          </motion.div>

          <motion.h1
            variants={item}
            className="display mt-4 line-clamp-2 max-w-[16ch] text-4xl text-white sm:text-5xl lg:text-6xl"
          >
            {movie.title}
          </motion.h1>

          {blurb ? (
            <motion.p
              variants={item}
              className="mt-4 line-clamp-2 max-w-[54ch] text-sm leading-relaxed text-white/80 sm:text-base"
            >
              {blurb}
            </motion.p>
          ) : null}

          <motion.div variants={item} className="mt-7">
            <Link
              href={`/movie/${movie.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-[#0a0a0c] transition hover:brightness-105 active:scale-[0.98]"
            >
              View film
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
