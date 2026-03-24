import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Button Component - 2026 Design System
 * Using CSS variables for theme consistency
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium",
    "transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    "active:scale-[0.98]"
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]",
          "shadow-sm hover:bg-[hsl(var(--primary))]/90",
        ].join(" "),

        destructive: [
          "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]",
          "shadow-sm hover:bg-[hsl(var(--destructive))]/90",
        ].join(" "),

        outline: [
          "border border-[hsl(var(--border))] bg-[hsl(var(--background))]",
          "text-[hsl(var(--foreground))] shadow-sm",
          "hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
        ].join(" "),

        secondary: [
          "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]",
          "shadow-sm hover:bg-[hsl(var(--secondary))]/80",
        ].join(" "),

        ghost: [
          "text-[hsl(var(--foreground))]",
          "hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
        ].join(" "),

        link: [
          "text-[hsl(var(--primary))] underline-offset-4 hover:underline",
        ].join(" "),
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(
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
