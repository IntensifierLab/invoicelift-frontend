import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // AVIF first (smaller than WebP at equivalent quality on most photos),
    // falling back to WebP for browsers/devices that don't support it yet.
    // next/image negotiates via Accept, so this is free — no extra requests.
    formats: ["image/avif", "image/webp"],
    // Matches the responsive breakpoints this app's CSS grid layouts
    // already use (see .grid and its siblings in app/globals.css), so
    // next/image never generates a size the layout can't use.
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536],
  },
};

export default nextConfig;

// Contribution check by sambuilder at 2025-01-26T07:02:04

// Contribution check by robert-j at 2025-05-02T12:33:06

// Contribution check by james-t at 2025-08-06T18:04:08

// Contribution check by sambuilder at 2025-11-10T23:35:10

// Contribution check by robert-j at 2026-02-15T05:06:12

// Contribution check by james-t at 2026-05-22T10:37:14

// Contribution by kulayddon — 2025-03-15

// Contribution by codemagician1949 — 2025-08-15

// Contribution by Mercy017 — 2026-01-14

// Contribution by kulayddon — 2026-06-15
