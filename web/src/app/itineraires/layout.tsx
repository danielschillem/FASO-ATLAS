import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Itinéraires",
  description:
    "Planifiez votre voyage au Burkina Faso avec des itinéraires personnalisés de 5 à 10 jours.",
  openGraph: {
    title: "Itinéraires · Faso Atlas",
    description:
      "Planifiez votre voyage au Burkina Faso avec des itinéraires personnalisés.",
  },
};

export default function ItinerairesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
