"use client";

import { CSSProperties } from "react";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Skeleton — a lightweight shimmer placeholder used to replace blank
 * flashes while data-fetching pages are loading.
 *
 * Pure CSS (no Tailwind dependency), driven by the project's design tokens
 * so it blends with the existing card/surface styling. The shimmer keyframe
 * is defined once in `app/globals.css` under `.skeleton-shimmer`.
 */
export function Skeleton({
  width,
  height,
  borderRadius = 8,
  className = "",
  style,
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`skeleton ${className}`.trim()}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        borderRadius: typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius,
        ...style,
      }}
    />
  );
}

/**
 * SkeletonBlock — a full-width paragraph/block placeholder made of two
 * stacked Skeleton lines, convenient for card bodies and list rows.
 */
export function SkeletonBlock({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`skeleton-block ${className}`.trim()} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === lines - 1 ? "55%" : "100%"}
          style={{ marginBottom: i === lines - 1 ? 0 : 10 }}
        />
      ))}
    </div>
  );
}