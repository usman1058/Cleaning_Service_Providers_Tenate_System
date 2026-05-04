import * as React from "react"

import { cn } from "@/lib/utils"

const badgeStyles: Record<string, string> = {
  default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
  destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
  outline: "text-foreground border-border/50",
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        badgeStyles[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
