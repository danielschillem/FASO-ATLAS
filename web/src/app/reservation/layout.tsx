import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réservation",
  description:
    "Réservez vos hébergements, hôtels, gîtes et restaurants au Burkina Faso avec tarifs en FCFA.",
  openGraph: {
    title: "Réservation · Faso Trip",
    description: "Réservez séjours et hébergements au Burkina Faso.",
  },
};

export default function ReservationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
