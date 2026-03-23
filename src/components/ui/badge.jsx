import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 ring-1 ring-inset",
  {
    variants: {
      variant: {
        default: "bg-blue-50 text-blue-700 ring-blue-600/20",
        secondary: "bg-gray-50 text-gray-700 ring-gray-500/20",
        destructive: "bg-red-50 text-red-700 ring-red-600/20",
        outline: "bg-transparent text-gray-700 ring-gray-300",
        success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
        // Category variants with modern colors
        politics_pt: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        politics_br: "bg-amber-50 text-amber-700 ring-amber-600/20",
        politics_world: "bg-sky-50 text-sky-700 ring-sky-600/20",
        controversies: "bg-pink-50 text-pink-700 ring-pink-600/20",
        conflicts: "bg-rose-50 text-rose-700 ring-rose-600/20",
        disasters: "bg-orange-50 text-orange-700 ring-orange-600/20",
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
