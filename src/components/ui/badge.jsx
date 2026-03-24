import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Badge Component - 2026 Design System
 *
 * Color system based on:
 * - WCAG 4.5:1 minimum contrast ratio
 * - Semantic colors for status indicators
 * - Comfortable contrast (not too stark)
 *
 * Light mode: Soft pastel backgrounds (100) + dark text (800)
 * Dark mode: Deep backgrounds (950) + light text (300)
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-colors",
  {
    variants: {
      variant: {
        // Neutral variants
        default: [
          "bg-zinc-100 text-zinc-800 border-zinc-300",
          "dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-600"
        ].join(" "),

        secondary: [
          "bg-zinc-100 text-zinc-600 border-zinc-200",
          "dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700"
        ].join(" "),

        outline: [
          "bg-transparent text-zinc-700 border-zinc-300",
          "dark:text-zinc-300 dark:border-zinc-600"
        ].join(" "),

        // Status variants (semantic)
        destructive: [
          "bg-rose-100 text-rose-800 border-rose-300",
          "dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800"
        ].join(" "),

        success: [
          "bg-emerald-100 text-emerald-800 border-emerald-300",
          "dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
        ].join(" "),

        warning: [
          "bg-amber-100 text-amber-800 border-amber-300",
          "dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
        ].join(" "),

        info: [
          "bg-sky-100 text-sky-800 border-sky-300",
          "dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800"
        ].join(" "),

        // Category variants for news dashboard
        politics_pt: [
          "bg-emerald-100 text-emerald-800 border-emerald-300",
          "dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
        ].join(" "),

        politics_br: [
          "bg-amber-100 text-amber-800 border-amber-300",
          "dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
        ].join(" "),

        politics_world: [
          "bg-sky-100 text-sky-800 border-sky-300",
          "dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800"
        ].join(" "),

        controversies: [
          "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300",
          "dark:bg-fuchsia-950 dark:text-fuchsia-300 dark:border-fuchsia-800"
        ].join(" "),

        conflicts: [
          "bg-rose-100 text-rose-800 border-rose-300",
          "dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800"
        ].join(" "),

        disasters: [
          "bg-orange-100 text-orange-800 border-orange-300",
          "dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800"
        ].join(" "),
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
