import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Routes culturelles",
  description:
    "Explorez les routes culturelles du Burkina Faso — Route du Balafon, Route des Masques et Route du Tissu à travers la région des Hauts-Bassins.",
  openGraph: {
    title: "Routes culturelles · Faso Trip",
    description:
      "Trois itinéraires patrimoniaux uniques : Balafon, Masques et Tissu dans les Hauts-Bassins du Burkina Faso.",
  },
};

export default function RoutesCulturellesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
