import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Découvrez les sites touristiques, réserves naturelles, lieux culturels et hébergements du Burkina Faso.",
  openGraph: {
    title: "Destinations · Faso Atlas",
    description:
      "Sites UNESCO, réserves naturelles, marchés et lieux culturels du Burkina Faso.",
  },
};

export default function DestinationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
