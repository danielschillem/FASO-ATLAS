/**
 * Faso Trip logo — pin vert + étoile dorée + typographie.
 * Variantes : "full" (icône + texte), "icon" (pin seul), "text" (texte seul).
 */

interface LogoProps {
  variant?: "full" | "icon" | "text";
  className?: string;
  /** Height of the icon in px (default 36) */
  size?: number;
  /** Dark mode: white text. Default follows parent color. */
  dark?: boolean;
}

function LogoIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* Pin body — vert Burkina */}
      <path d="M80,245 L31,144 A55,55,0,1,1,129,144 Z" fill="#006B3C" />
      {/* Étoile dorée */}
      <path
        d="M80,88 L88,109 L110,110 L93,124 L99,146 L80,134 L61,146 L67,124 L50,110 L72,109 Z"
        fill="#FCD116"
      />
    </svg>
  );
}

function LogoText({ dark }: { dark?: boolean }) {
  return (
    <span className="flex flex-col leading-none select-none">
      <span
        className={`text-[1.1em] font-extrabold tracking-tight ${dark ? "text-blanc" : "text-nuit"}`}
      >
        FASO
      </span>
      <span className="text-[0.75em] font-light tracking-[0.18em] text-vert">
        TRIP
      </span>
    </span>
  );
}

export function Logo({
  variant = "full",
  className = "",
  size = 36,
  dark,
}: LogoProps) {
  if (variant === "icon") {
    return (
      <span className={className}>
        <LogoIcon size={size} />
      </span>
    );
  }

  if (variant === "text") {
    return (
      <span className={className}>
        <LogoText dark={dark} />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoIcon size={size} />
      <LogoText dark={dark} />
    </span>
  );
}
