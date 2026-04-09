import {
  Landmark,
  TreePine,
  Drama,
  Hotel,
  UtensilsCrossed,
  Home,
  Tent,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { clsx } from "clsx";

const TYPE_CONFIG: Record<string, { Icon: LucideIcon; gradient: string }> = {
  site: { Icon: Landmark, gradient: "from-rouge/20 to-rouge/5" },
  nature: { Icon: TreePine, gradient: "from-vert/20 to-vert/5" },
  culture: { Icon: Drama, gradient: "from-or/20 to-or/5" },
  hotel: { Icon: Hotel, gradient: "from-nuit/15 to-nuit/5" },
  restaurant: { Icon: UtensilsCrossed, gradient: "from-rouge/15 to-or/5" },
  gite: { Icon: Home, gradient: "from-vert/15 to-vert/5" },
  camp: { Icon: Tent, gradient: "from-or/15 to-vert/5" },
};

const DEFAULT_CONFIG = { Icon: MapPin, gradient: "from-sable-2 to-sable" };

interface Props {
  type?: string;
  label?: string;
  className?: string;
}

export function PlaceholderImage({ type, label, className }: Props) {
  const { Icon, gradient } = TYPE_CONFIG[type ?? ""] ?? DEFAULT_CONFIG;

  return (
    <div
      className={clsx(
        "w-full h-full flex flex-col items-center justify-center bg-gradient-to-br gap-2",
        gradient,
        className,
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-blanc/60 backdrop-blur-sm flex items-center justify-center shadow-sm">
        <Icon className="w-8 h-8 text-gris" strokeWidth={1.5} />
      </div>
      {label && (
        <span className="text-xs text-gris font-medium max-w-[80%] text-center truncate">
          {label}
        </span>
      )}
    </div>
  );
}
