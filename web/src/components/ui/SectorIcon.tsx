import type { LucideIcon } from "lucide-react";
import {
  Landmark,
  TreePine,
  Drama,
  Hotel,
  Home,
  UtensilsCrossed,
  Tent,
  Car,
  Compass,
  Map,
  Scroll,
  BookOpen,
  Camera,
  Mountain,
  Waves,
  Music,
  Palette,
  Church,
  Shield,
  Gem,
  Binoculars,
  Bike,
  Footprints,
  Flame,
  Sun,
} from "lucide-react";
import { clsx } from "clsx";

export type SectorType =
  | "site"
  | "nature"
  | "culture"
  | "hotel"
  | "gite"
  | "restaurant"
  | "camp"
  | "transport"
  | "itineraire"
  | "carte"
  | "atlas"
  | "wiki"
  | "photo"
  | "montagne"
  | "eau"
  | "musique"
  | "artisanat"
  | "sacre"
  | "patrimoine"
  | "safari"
  | "aventure"
  | "velo"
  | "randonnee"
  | "tradition"
  | "soleil";

interface SectorConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  gradient: string;
  label: string;
}

const SECTOR_MAP: Record<SectorType, SectorConfig> = {
  site: {
    icon: Landmark,
    color: "text-rouge",
    bgColor: "bg-rouge/8",
    gradient: "from-rouge/20 to-rouge/5",
    label: "Site touristique",
  },
  nature: {
    icon: TreePine,
    color: "text-vert",
    bgColor: "bg-vert/8",
    gradient: "from-vert/20 to-vert/5",
    label: "Nature",
  },
  culture: {
    icon: Drama,
    color: "text-accent",
    bgColor: "bg-accent/8",
    gradient: "from-accent/20 to-accent/5",
    label: "Culture",
  },
  hotel: {
    icon: Hotel,
    color: "text-vert",
    bgColor: "bg-vert/8",
    gradient: "from-vert/20 to-vert/5",
    label: "Hôtel",
  },
  gite: {
    icon: Home,
    color: "text-terre",
    bgColor: "bg-terre/8",
    gradient: "from-terre/20 to-terre/5",
    label: "Gîte",
  },
  restaurant: {
    icon: UtensilsCrossed,
    color: "text-or",
    bgColor: "bg-or/10",
    gradient: "from-or/20 to-or/5",
    label: "Restaurant",
  },
  camp: {
    icon: Tent,
    color: "text-vert",
    bgColor: "bg-vert/8",
    gradient: "from-vert/20 to-vert/5",
    label: "Campement",
  },
  transport: {
    icon: Car,
    color: "text-nuit",
    bgColor: "bg-nuit/8",
    gradient: "from-nuit/20 to-nuit/5",
    label: "Transport",
  },
  itineraire: {
    icon: Compass,
    color: "text-rouge",
    bgColor: "bg-rouge/8",
    gradient: "from-rouge/20 to-rouge/5",
    label: "Itinéraire",
  },
  carte: {
    icon: Map,
    color: "text-vert",
    bgColor: "bg-vert/8",
    gradient: "from-vert/20 to-vert/5",
    label: "Carte",
  },
  atlas: {
    icon: Scroll,
    color: "text-terre",
    bgColor: "bg-terre/8",
    gradient: "from-terre/20 to-terre/5",
    label: "Atlas",
  },
  wiki: {
    icon: BookOpen,
    color: "text-accent",
    bgColor: "bg-accent/8",
    gradient: "from-accent/20 to-accent/5",
    label: "Wiki",
  },
  photo: {
    icon: Camera,
    color: "text-or",
    bgColor: "bg-or/10",
    gradient: "from-or/20 to-or/5",
    label: "Photo",
  },
  montagne: {
    icon: Mountain,
    color: "text-terre",
    bgColor: "bg-terre/8",
    gradient: "from-terre/20 to-terre/5",
    label: "Montagne",
  },
  eau: {
    icon: Waves,
    color: "text-accent",
    bgColor: "bg-accent/8",
    gradient: "from-accent/20 to-accent/5",
    label: "Point d'eau",
  },
  musique: {
    icon: Music,
    color: "text-or",
    bgColor: "bg-or/10",
    gradient: "from-or/20 to-or/5",
    label: "Musique",
  },
  artisanat: {
    icon: Palette,
    color: "text-terre",
    bgColor: "bg-terre/8",
    gradient: "from-terre/20 to-terre/5",
    label: "Artisanat",
  },
  sacre: {
    icon: Church,
    color: "text-accent",
    bgColor: "bg-accent/8",
    gradient: "from-accent/20 to-accent/5",
    label: "Lieu sacré",
  },
  patrimoine: {
    icon: Shield,
    color: "text-rouge",
    bgColor: "bg-rouge/8",
    gradient: "from-rouge/20 to-rouge/5",
    label: "Patrimoine",
  },
  safari: {
    icon: Binoculars,
    color: "text-vert",
    bgColor: "bg-vert/8",
    gradient: "from-vert/20 to-vert/5",
    label: "Safari",
  },
  aventure: {
    icon: Gem,
    color: "text-or",
    bgColor: "bg-or/10",
    gradient: "from-or/20 to-or/5",
    label: "Aventure",
  },
  velo: {
    icon: Bike,
    color: "text-vert",
    bgColor: "bg-vert/8",
    gradient: "from-vert/20 to-vert/5",
    label: "Vélo",
  },
  randonnee: {
    icon: Footprints,
    color: "text-terre",
    bgColor: "bg-terre/8",
    gradient: "from-terre/20 to-terre/5",
    label: "Randonnée",
  },
  tradition: {
    icon: Flame,
    color: "text-rouge",
    bgColor: "bg-rouge/8",
    gradient: "from-rouge/20 to-rouge/5",
    label: "Tradition",
  },
  soleil: {
    icon: Sun,
    color: "text-or",
    bgColor: "bg-or/10",
    gradient: "from-or/20 to-or/5",
    label: "Soleil",
  },
};

export function getSectorConfig(type: string): SectorConfig {
  return SECTOR_MAP[type as SectorType] ?? SECTOR_MAP.site;
}

interface SectorIconProps {
  type: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "filled" | "outline" | "gradient";
  className?: string;
}

const SIZE_CLASSES = {
  sm: { container: "w-8 h-8 rounded-lg", icon: "w-4 h-4" },
  md: { container: "w-11 h-11 rounded-xl", icon: "w-5 h-5" },
  lg: { container: "w-14 h-14 rounded-2xl", icon: "w-6 h-6" },
  xl: { container: "w-16 h-16 rounded-2xl", icon: "w-8 h-8" },
};

export function SectorIcon({
  type,
  size = "md",
  variant = "filled",
  className,
}: SectorIconProps) {
  const config = getSectorConfig(type);
  const Icon = config.icon;
  const sizeConfig = SIZE_CLASSES[size];

  return (
    <div
      className={clsx(
        sizeConfig.container,
        "flex items-center justify-center shrink-0 transition-all duration-300",
        variant === "filled" && config.bgColor,
        variant === "outline" && "border-2 border-current bg-transparent",
        variant === "gradient" && `bg-gradient-to-br ${config.gradient}`,
        className,
      )}
    >
      <Icon className={clsx(sizeConfig.icon, config.color)} strokeWidth={1.8} />
    </div>
  );
}
