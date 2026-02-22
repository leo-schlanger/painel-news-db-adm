import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const Pagination = ({ className, ...props }) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
)
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("", className)} {...props} />
  )
)
PaginationItem.displayName = "PaginationItem"

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}) => (
  <Button
    aria-current={isActive ? "page" : undefined}
    variant={isActive ? "outline" : "ghost"}
    size={size}
    className={cn(
      isActive && "border-blue-500 bg-blue-50 text-blue-600",
      className
    )}
    {...props}
  />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({ className, ...props }) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Anterior</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({ className, ...props }) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Proximo</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({ className, ...props }) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

// Simple pagination component
function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  showInfo = true,
  totalCount,
  perPage,
  className
}) {
  if (totalPages <= 1) return null

  const start = ((currentPage - 1) * perPage) + 1
  const end = Math.min(currentPage * perPage, totalCount)

  return (
    <div className={cn("flex items-center justify-between px-4 py-3 border-t border-gray-200", className)}>
      {showInfo && (
        <p className="text-sm text-gray-500">
          Mostrando {start} - {end} de {totalCount?.toLocaleString()}
        </p>
      )}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm text-gray-600">
          Pagina {currentPage} de {totalPages}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  SimplePagination,
}
