import Link from "next/link";

interface LogoProps {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Wrap in a Link to home */
  linked?: boolean;
  className?: string;
}

const sizes = {
  sm: { svg: 20, text: "text-sm", gap: "gap-2" },
  md: { svg: 26, text: "text-base", gap: "gap-2.5" },
  lg: { svg: 32, text: "text-xl", gap: "gap-3" },
};

function LogoMark({ svgSize }: { svgSize: number }) {
  return (
    <svg
      width={svgSize}
      height={svgSize}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer ring */}
      <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="2.4" />
      {/* Punch-out circle → creates the crescent / C shape */}
      <circle cx="17" cy="14" r="9" fill="var(--bg-base)" />
    </svg>
  );
}

function LogoInner({ size = "md", className = "" }: Pick<LogoProps, "size" | "className">) {
  const { svg, text, gap } = sizes[size!];
  return (
    <span className={`inline-flex items-center ${gap} ${className}`}>
      <LogoMark svgSize={svg} />
      <span
        className={`font-bold tracking-[0.13em] uppercase ${text}`}
        style={{ fontFamily: "inherit" }}
      >
        C·H
      </span>
    </span>
  );
}

export default function Logo({ size = "md", linked = false, className = "" }: LogoProps) {
  if (linked) {
    return (
      <Link href="/" className={`inline-flex items-center ${className}`}>
        <LogoInner size={size} />
      </Link>
    );
  }
  return <LogoInner size={size} className={className} />;
}
