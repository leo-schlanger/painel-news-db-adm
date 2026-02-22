import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-blue-100 text-blue-800",
        secondary: "bg-gray-100 text-gray-800",
        destructive: "bg-red-100 text-red-800",
        outline: "border border-gray-300 text-gray-700",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        // Category variants
        politics_pt: "bg-green-100 text-green-800",
        politics_br: "bg-yellow-100 text-yellow-800",
        politics_world: "bg-blue-100 text-blue-800",
        controversies: "bg-pink-100 text-pink-800",
        conflicts: "bg-red-100 text-red-800",
        disasters: "bg-orange-100 text-orange-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
