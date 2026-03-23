import * as React from "react"
import { cn } from "@/lib/utils"

const InputWithIcon = React.forwardRef(
  ({ className, type, icon: Icon, iconPosition = "left", ...props }, ref) => {
    return (
      <div className="relative w-full group">
        {Icon && iconPosition === "left" && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Icon className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" aria-hidden="true" />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-xl border border-gray-200 bg-white py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 transition-all duration-200 hover:border-gray-300",
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
            <Icon className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" aria-hidden="true" />
          </div>
        )}
      </div>
    )
  }
)
InputWithIcon.displayName = "InputWithIcon"

export { InputWithIcon }
