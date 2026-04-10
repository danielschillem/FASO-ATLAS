// Faso Trip Service Worker — Minimal, safe caching strategy
// IMPORTANT: Never cache _next/ assets — Next.js handles its own caching via content hashing
const CACHE_NAME = "faso-trip-v3";

// Install: activate immediately
self.addEventListener("install", () => self.skipWaiting());

// Activate: clean ALL old caches, then claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Fetch: only cache public static assets (icons, images, manifest)
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  // Never intercept Next.js build assets or HMR — let the browser handle them
  if (url.pathname.startsWith("/_next/")) return;

  // Only cache truly static public files (icons, manifest, images in /public)
  const isStaticPublic =
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname === "/manifest.json" ||
    url.pathname === "/icon-192.svg";

  if (!isStaticPublic) return;

  // Network-first for these static assets
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request)),
  );
});
