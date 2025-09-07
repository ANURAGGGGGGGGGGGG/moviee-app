"use client";
import { useEffect, useRef } from "react";

export default function LenisProvider({ children }) {
  const rafRef = useRef(null);
  const lenisRef = useRef(null);

  useEffect(() => {
    let isCancelled = false;

    async function setup() {
      // Respect user reduced motion preference
      const prefersReduced = typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      try {
        const { default: Lenis } = await import("lenis");
        if (isCancelled) return;

        const lenis = new Lenis({});
        lenisRef.current = lenis;

        const raf = (time) => {
          lenis.raf(time);
          rafRef.current = requestAnimationFrame(raf);
        };
        rafRef.current = requestAnimationFrame(raf);
      } catch (e) {
        // If lenis is not installed, fail gracefully without breaking the app
        console.warn("Lenis not available:", e);
      }
    }

    setup();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (lenisRef.current) {
        try { lenisRef.current.destroy(); } catch {}
        lenisRef.current = null;
      }
      isCancelled = true;
    };
  }, []);

  return children;
}