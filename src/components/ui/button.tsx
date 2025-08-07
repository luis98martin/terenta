import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground active:bg-primary/90 rounded-xl shadow-md",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl shadow-md",
        outline:
          "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-xl",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl shadow-md",
        ghost: "hover:bg-accent/10 hover:text-accent rounded-xl",
        link: "text-primary underline-offset-4 hover:underline",
        // TeRenta? enhanced variants
        mustard: "bg-accent text-accent-foreground active:bg-accent/90 rounded-xl shadow-accent font-semibold",
        "mustard-outline": "border-2 border-accent text-accent bg-transparent active:bg-accent active:text-accent-foreground rounded-xl shadow-sm",
        hero: "bg-gradient-to-r from-accent via-accent to-mustard-dark text-accent-foreground active:from-accent/90 active:via-accent/90 active:to-mustard-dark/90 rounded-xl shadow-accent font-bold text-base",
        glass: "bg-surface/80 backdrop-blur-sm border border-border/50 active:bg-surface/90 rounded-xl shadow-sm",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 rounded-lg px-3",
        lg: "h-14 rounded-xl px-8 text-base",
        icon: "h-12 w-12 rounded-xl",
        "icon-sm": "h-9 w-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
