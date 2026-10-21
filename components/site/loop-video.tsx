"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A muted, looping clip with a poster frame. Plays only while on screen; stays on the poster for reduced motion.
 * Nothing is fetched until the clip comes near the viewport: the poster is a lazy image underneath (so it also
 * shows without script), and the video gets its source only when it is about to be seen.
 */
export function LoopVideo({ src, poster, label, className }: { src: string; poster: string; label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const visible = useRef(false);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Give it a source a little before it scrolls in...
    const approach = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), { rootMargin: "400px 0px" });
    // ...and play only while a fifth of it is on screen.
    const watch = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        if (entry.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.2 },
    );
    approach.observe(video);
    watch.observe(video);
    return () => {
      approach.disconnect();
      watch.disconnect();
    };
  }, []);

  // Already on screen when the source arrives (e.g. the page opened right here): start now.
  useEffect(() => {
    if (near && visible.current) void ref.current?.play().catch(() => {});
  }, [near]);

  return (
    <span className="relative block h-full w-full">
      {/* eslint-disable-next-line @next/next/no-img-element -- the same file the video uses as its poster */}
      <img src={poster} alt="" aria-hidden loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      <video
        ref={ref}
        className={cn("relative h-full w-full object-cover", className)}
        src={near ? src : undefined}
        poster={near ? poster : undefined}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
      />
    </span>
  );
}
