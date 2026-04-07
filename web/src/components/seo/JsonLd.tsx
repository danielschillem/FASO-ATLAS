interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", ...data }),
      }}
    />
  );
}

export function placeJsonLd(place: {
  name: string;
  description?: string;
  lat?: number;
  lng?: number;
  rating?: number;
  reviewCount?: number;
  images?: { url: string }[];
  region?: { name: string };
}) {
  return {
    "@type": "TouristAttraction",
    name: place.name,
    description: place.description,
    ...(place.lat && place.lng
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: place.lat,
            longitude: place.lng,
          },
        }
      : {}),
    ...(place.region?.name
      ? {
          address: {
            "@type": "PostalAddress",
            addressCountry: "BF",
            addressRegion: place.region.name,
          },
        }
      : {}),
    ...(place.rating && place.reviewCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: place.rating,
            bestRating: 5,
            ratingCount: place.reviewCount,
          },
        }
      : {}),
    ...(place.images?.length
      ? { image: place.images.map((img) => img.url) }
      : {}),
  };
}
