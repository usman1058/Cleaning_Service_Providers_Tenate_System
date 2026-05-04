import * as React from "react"

import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-lg bg-muted/70",
        className
      )}
      {...props}
    />
  )
}

function CardSkeleton({
  title = true,
  description = false,
  lines = 2,
  className,
}: {
  title?: boolean
  description?: boolean
  lines?: number
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-4 p-6", className)}>
      {(title || description) && (
        <div className="flex flex-col gap-2">
          {title && <Skeleton className="h-5 w-2/5" />}
          {description && <Skeleton className="h-4 w-3/5" />}
        </div>
      )}
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-4/5" : "w-full"
          )}
        />
      ))}
    </div>
  )
}

function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-4 p-6", className)}>
      <Skeleton className="h-6 w-1/4" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton
                key={j}
                className={cn(
                  "h-4 flex-1",
                  j === columns - 1 && "max-w-[100px]"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export { Skeleton, CardSkeleton, TableSkeleton }
