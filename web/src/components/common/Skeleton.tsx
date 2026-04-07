"use client";

import { clsx } from "clsx";

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className, count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={clsx("bg-sable animate-pulse rounded", className)}
        />
      ))}
    </>
  );
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-card overflow-hidden border border-sable-2"
        >
          <div className="h-44 bg-sable animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-sable animate-pulse rounded w-3/4" />
            <div className="h-3 bg-sable animate-pulse rounded w-1/2" />
            <div className="h-3 bg-sable animate-pulse rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="min-h-screen pt-nav bg-blanc">
      <div className="h-80 bg-sable animate-pulse" />
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="h-8 bg-sable animate-pulse rounded w-2/3" />
        <div className="h-4 bg-sable animate-pulse rounded w-1/3" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-sable animate-pulse rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-20 bg-sable rounded-card animate-pulse" />
      ))}
    </div>
  );
}
