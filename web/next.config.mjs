/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
    NEXT_PUBLIC_MAP_TILES:
      process.env.NEXT_PUBLIC_MAP_TILES ||
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN:
      process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || "",
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "",
  },
};

export default nextConfig;
