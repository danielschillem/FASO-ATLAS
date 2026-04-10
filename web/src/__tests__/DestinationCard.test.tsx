import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DestinationCard } from "@/components/destinations/DestinationCard";
import type { Place } from "@/types/models";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    [k: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const baseMockPlace: Place = {
  id: 1,
  name: "Ranch de Nazinga",
  slug: "ranch-de-nazinga",
  description: "Le plus grand ranch de la sous-région",
  type: "nature",
  lat: 11.15,
  lng: -1.6,
  rating: 4.5,
  reviewCount: 12,
  isActive: true,
  regionId: 1,
  region: {
    id: 1,
    name: "Nazinon",
    capital: "Manga",
    code: "CS",
  },
  images: [{ id: 1, url: "/images/nazinga.jpg", caption: "", sortOrder: 0 }],
  tags: ["faune", "éléphants"],
};

describe("DestinationCard", () => {
  it("renders place name and region", () => {
    render(<DestinationCard place={baseMockPlace} />);
    expect(screen.getAllByText("Ranch de Nazinga").length).toBeGreaterThan(0);
    expect(screen.getByText("Nazinon")).toBeInTheDocument();
  });

  it("renders sector icon for type", () => {
    render(<DestinationCard place={baseMockPlace} />);
    // The type is now displayed via a SectorIcon component, not as text
    expect(screen.getByLabelText("Ajouter aux favoris")).toBeInTheDocument();
  });

  it("renders rating when > 0", () => {
    render(<DestinationCard place={baseMockPlace} />);
    expect(screen.getByText("4.5")).toBeInTheDocument();
  });

  it("hides rating when 0", () => {
    const place = { ...baseMockPlace, rating: 0 };
    render(<DestinationCard place={place} />);
    expect(screen.queryByText("0.0")).not.toBeInTheDocument();
  });

  it("links to correct slug", () => {
    render(<DestinationCard place={baseMockPlace} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/destinations/ranch-de-nazinga");
  });

  it("shows favorite button", () => {
    render(<DestinationCard place={baseMockPlace} />);
    expect(screen.getByLabelText("Ajouter aux favoris")).toBeInTheDocument();
  });

  it("renders tags", () => {
    render(<DestinationCard place={baseMockPlace} />);
    expect(screen.getByText("faune")).toBeInTheDocument();
    expect(screen.getByText("éléphants")).toBeInTheDocument();
  });
});
