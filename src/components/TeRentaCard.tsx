import { cn } from "@/lib/utils";
import { ReactNode, CSSProperties } from "react";

interface TeRentaCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "interactive" | "highlighted";
  style?: CSSProperties;
  onClick?: () => void;
}

export function TeRentaCard({ children, className, variant = "default", style, onClick }: TeRentaCardProps) {
  return (
    <div
      className={cn(
        "bg-surface rounded-2xl p-6 border border-border/50",
        variant === "default" && "shadow-card",
        variant === "interactive" && "shadow-card border-border/50",
        variant === "highlighted" && "shadow-accent border-accent/30 bg-gradient-to-br from-surface to-accent/5",
        onClick && "cursor-pointer",
        className
      )}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}