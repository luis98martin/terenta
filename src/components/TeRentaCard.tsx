import { cn } from "@/lib/utils";
import { ReactNode, CSSProperties } from "react";

interface TeRentaCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "interactive" | "highlighted";
  style?: CSSProperties;
}

export function TeRentaCard({ children, className, variant = "default", style }: TeRentaCardProps) {
  return (
    <div
      className={cn(
        "bg-surface rounded-lg p-5 transition-all duration-200",
        variant === "default" && "shadow-[0_4px_12px_hsl(var(--burgundy)/0.1)]",
        variant === "interactive" && "shadow-[0_4px_12px_hsl(var(--burgundy)/0.1)] hover:shadow-[0_6px_16px_hsl(var(--burgundy)/0.15)] hover:scale-[1.02] cursor-pointer",
        variant === "highlighted" && "shadow-[0_6px_16px_hsl(var(--mustard)/0.2)] border border-accent/20",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}