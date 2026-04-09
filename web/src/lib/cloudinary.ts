/**
 * Cloudinary image optimization utilities.
 *
 * Transforms Cloudinary URLs to apply automatic format, quality,
 * and dimension optimizations on-the-fly.
 *
 * Example:
 *   optimizeImage("https://res.cloudinary.com/demo/image/upload/v1/photo.jpg", { width: 800 })
 *   → "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_800/v1/photo.jpg"
 */

interface ImageOptions {
  width?: number;
  height?: number;
  quality?: "auto" | "auto:low" | "auto:good" | "auto:best" | number;
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
  crop?: "fill" | "fit" | "scale" | "thumb" | "limit";
  gravity?: "auto" | "face" | "center";
}

const CLOUDINARY_UPLOAD_PATTERN = /\/upload\/(?:v\d+\/)?/;

export function optimizeImage(
  url: string | undefined | null,
  options: ImageOptions = {},
): string {
  if (!url) return "";

  // Only transform Cloudinary URLs
  if (!url.includes("res.cloudinary.com")) return url;

  const transforms: string[] = [];

  // Auto format & quality by default
  transforms.push(`f_${options.format ?? "auto"}`);
  transforms.push(`q_${options.quality ?? "auto"}`);

  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  if (options.crop) transforms.push(`c_${options.crop}`);
  if (options.gravity) transforms.push(`g_${options.gravity}`);

  const transformStr = transforms.join(",");

  // Insert transformations after /upload/
  return url.replace(CLOUDINARY_UPLOAD_PATTERN, (match) => {
    return `/upload/${transformStr}/${match.replace("/upload/", "")}`;
  });
}

/** Preset optimized sizes for common usage */
export const imagePresets = {
  thumbnail: {
    width: 150,
    height: 150,
    crop: "thumb" as const,
    gravity: "auto" as const,
  },
  card: { width: 400, height: 300, crop: "fill" as const },
  hero: { width: 1200, height: 600, crop: "fill" as const },
  avatar: {
    width: 96,
    height: 96,
    crop: "thumb" as const,
    gravity: "face" as const,
  },
  gallery: { width: 800, crop: "limit" as const },
} as const;
