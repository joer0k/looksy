import * as React from "react"

import { cn } from "@/lib/utils"

type FieldProps = {
  id: string
  label: React.ReactNode
  hint?: React.ReactNode
  optionalLabel?: string
  className?: string
  children: React.ReactNode
}

/**
 * Label + control + hint. The control must set `id` and, when a hint is given,
 * `aria-describedby={hintId(id)}`.
 */
function Field({ id, label, hint, optionalLabel, className, children }: FieldProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {optionalLabel && <span className="ml-1.5 font-normal text-ink-muted">· {optionalLabel}</span>}
      </label>
      {children}
      {hint && (
        <p id={hintId(id)} className="text-[0.8125rem] leading-snug text-ink-muted">
          {hint}
        </p>
      )}
    </div>
  )
}

function hintId(id: string) {
  return `${id}-hint`
}

export { Field, hintId }
