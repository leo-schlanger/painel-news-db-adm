import * as React from "react"
import { cn } from "@/lib/utils"

const InputWithIcon = React.forwardRef(
  ({ className, type, icon: Icon, iconPosition = "left", ...props }, ref) => {
    return (
      <div className="relative w-full group">
        {Icon && iconPosition === "left" && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Icon className="h-4 w-4 text-[hsl(var(--muted-foreground))] group-focus-within:text-blue-500 transition-colors" aria-hidden="true" />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] py-2 text-sm text-[hsl(var(--foreground))] shadow-sm placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-[hsl(var(--border))]/80",
            Icon && iconPosition === "left" && "pl-10 pr-4",
            Icon && iconPosition === "right" && "pl-4 pr-10",
            !Icon && "px-4",
            className
          )}
          ref={ref}
          {...props}
        />
        {Icon && iconPosition === "right" && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
            <Icon className="h-4 w-4 text-[hsl(var(--muted-foreground))] group-focus-within:text-blue-500 transition-colors" aria-hidden="true" />
          </div>
        )}
      </div>
    )
  }
)
InputWithIcon.displayName = "InputWithIcon"

export { InputWithIcon }
