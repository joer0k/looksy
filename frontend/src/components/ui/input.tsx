import * as React from "react"

import { cn } from "@/lib/utils"

/** Shared look for text inputs and native selects. */
export const controlClassName =
  "h-11 w-full min-w-0 rounded-control border border-line-strong bg-surface px-3.5 text-base text-ink transition-colors outline-none hover:border-ink-muted focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-55 aria-invalid:border-danger sm:text-[0.9375rem]"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return <input type={type} data-slot="input" className={cn(controlClassName, className)} {...props} />
}

export { Input }
