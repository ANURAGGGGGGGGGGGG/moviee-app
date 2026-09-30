"use client";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { Star } from "lucide-react";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP_BASE = "https://image.tmdb.org/t/p/w780";

const SIZES =
  "(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1280px) 25vw, 220px";

export default function PosterCard({ movie, index = 0 }) {
  const reduce = useReducedMotion();

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [5.5, -5.5]), {
    stiffness: 220,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-6.5, 6.5]), {
    stiffness: 220,
    damping: 20,
  });

  function handlePointerMove(event) {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function handlePointerLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  const poster = movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null;
  const backdrop = movie.backdrop_path ? `${TMDB_BACKDROP_BASE}${movie.backdrop_path}` : null;
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
  const rating =
    typeof movie.vote_average === "number" && movie.vote_average > 0
      ? movie.vote_average.toFixed(1)
      : null;

  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay: Math.min(index, 6) * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group"
    >
      <Link
        href={`/movie/${movie.id}`}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="block rounded-none focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        aria-label={`${movie.title}${year ? ` (${year})` : ""}`}
      >
        <motion.div
          style={{ rotateX: reduce ? 0 : rotateX, rotateY: reduce ? 0 : rotateY, transformPerspective: 900 }}
          className="relative aspect-[2/3] overflow-hidden bg-surface-raised ring-1 ring-line transition-[box-shadow,ring-color] duration-500 group-hover:ring-accent group-focus-within:ring-accent group-hover:shadow-[0_24px_60px_-24px_rgb(19_19_22/0.55)]"
        >
          {poster ? (
            <Image
              src={poster}
              alt={movie.title || "Movie poster"}
              fill
              sizes={SIZES}
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center px-3 text-center text-xs text-ink-faint">
              No image
            </div>
          )}

          {backdrop && poster ? (
            <Image
              src={backdrop}
              alt=""
              fill
              sizes={SIZES}
              aria-hidden="true"
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          ) : null}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-focus-within:scale-x-100" />
        </motion.div>

        <div className="pt-3">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-ink transition-colors duration-300 group-hover:text-accent-ink">
            {movie.title || movie.name}
          </h3>
          <div className="slate mt-2 flex items-center justify-between gap-2 text-ink-faint">
            <span>{year ?? "TBA"}</span>
            {rating ? (
              <span className="flex items-center gap-1.5 text-ink-dim">
                <Star
                  className="h-3 w-3 text-accent"
                  fill="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                {rating}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.li>
  );
}
