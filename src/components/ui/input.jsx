import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2 text-sm text-[hsl(var(--foreground))] shadow-sm placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-[hsl(var(--border))]/80",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
