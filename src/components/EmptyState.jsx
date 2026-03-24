import { cn } from '@/lib/utils'

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {Icon && (
        <div className="w-16 h-16 bg-[hsl(var(--muted))] rounded-2xl flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-[hsl(var(--muted-foreground))] max-w-sm mb-4">
          {description}
        </p>
      )}
      {action}
    </div>
  )
}
