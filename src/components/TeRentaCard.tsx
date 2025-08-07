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
        "bg-surface rounded-2xl p-6 transition-all duration-200 border border-border/50",
        variant === "default" && "shadow-card hover:shadow-card-hover",
        variant === "interactive" && "shadow-card hover:shadow-card-hover hover:scale-[1.02] cursor-pointer hover:border-accent/20",
        variant === "highlighted" && "shadow-accent border-accent/30 bg-gradient-to-br from-surface to-accent/5",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}