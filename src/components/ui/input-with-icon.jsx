import * as React from "react"
import { cn } from "@/lib/utils"

const InputWithIcon = React.forwardRef(
  ({ className, type, icon: Icon, iconPosition = "left", ...props }, ref) => {
    return (
      <div className="relative w-full">
        {Icon && iconPosition === "left" && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg border border-gray-300 bg-white py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
            Icon && iconPosition === "left" && "pl-10 pr-3",
            Icon && iconPosition === "right" && "pl-3 pr-10",
            !Icon && "px-3",
            className
          )}
          ref={ref}
          {...props}
        />
        {Icon && iconPosition === "right" && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        )}
      </div>
    )
  }
)
InputWithIcon.displayName = "InputWithIcon"

export { InputWithIcon }
