import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-20 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm shadow-xs transition-all duration-200 ease-out outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "hover:border-ring/50",
        "focus-visible:ring-2 focus-visible:shadow-md",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
