"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const SLIDES = [
  {
    src: "/hero/cascadesdeBanfora.jpg",
    alt: "Cascades de Banfora",
    location: "Cascades, Banfora",
  },
  {
    src: "/hero/Domes_de_Fabedougou.jpg",
    alt: "Dômes de Fabédougou",
    location: "Fabédougou, Banfora",
  },
  {
    src: "/hero/habitant-de-la-mare.jpg",
    alt: "Habitants de la mare aux hippopotames",
    location: "Mare aux hippos, Bobo",
  },
  {
    src: "/hero/mosqueeBani.jpg",
    alt: "Mosquée de Bani",
    location: "Bani, Sahel",
  },
  {
    src: "/hero/Ouagacathedrale.png",
    alt: "Cathédrale de Ouagadougou",
    location: "Ouagadougou",
  },
];

const INTERVAL = 6000;

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning || index === current) return;
      setIsTransitioning(true);
      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), 1000);
    },
    [current, isTransitioning],
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          className="absolute inset-0 transition-all duration-[1.2s] ease-out"
          style={{
            opacity: i === current ? 1 : 0,
            transform: i === current ? "scale(1)" : "scale(1.08)",
          }}
          aria-hidden={i !== current ? "true" : undefined}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            className="object-cover"
            priority={i === 0}
            sizes="100vw"
            quality={85}
          />
        </div>
      ))}

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-nuit/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-nuit/80 via-transparent to-nuit/30" />

      {/* Bottom fade to blanc */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blanc to-transparent z-[1]" />

      {/* Slide indicators */}
      <div className="absolute bottom-36 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            onClick={() => goTo(i)}
            aria-label={`Aller à ${slide.alt}`}
            className="group relative flex items-center"
          >
            <div
              className={`h-1 rounded-full transition-all duration-500 ${
                i === current
                  ? "w-8 bg-blanc"
                  : "w-2 bg-blanc/40 group-hover:bg-blanc/60"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Current location badge */}
      <div className="absolute bottom-40 right-6 sm:right-10 z-20 hidden md:flex items-center gap-2 px-3 py-1.5 bg-blanc/10 backdrop-blur-md rounded-full border border-blanc/20 text-blanc/70 text-xs">
        <svg
          className="w-3 h-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0 1 15 0Z"
          />
        </svg>
        <span>{SLIDES[current].location}</span>
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-20">
        <div
          className="h-full bg-or transition-none"
          style={{
            animation: `hero-progress ${INTERVAL}ms linear infinite`,
            width: "100%",
          }}
          key={current}
        />
      </div>

      <style jsx>{`
        @keyframes hero-progress {
          from {
            transform: scaleX(0);
            transform-origin: left;
          }
          to {
            transform: scaleX(1);
            transform-origin: left;
          }
        }
      `}</style>
    </>
  );
}
