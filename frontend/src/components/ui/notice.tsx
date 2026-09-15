import * as React from "react"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const noticeVariants = cva("flex gap-3 rounded-control px-4 py-3 text-sm leading-snug", {
  variants: {
    tone: {
      error: "bg-danger-soft text-danger",
      success: "bg-success-soft text-success",
      info: "bg-notice-soft text-notice",
    },
  },
  defaultVariants: { tone: "error" },
})

const icons = { error: AlertCircle, success: CheckCircle2, info: Info }

type NoticeProps = React.ComponentProps<"div"> &
  VariantProps<typeof noticeVariants> & {
    title?: React.ReactNode
  }

/** Inline status message. Errors are announced with role="alert", others politely. */
function Notice({ tone = "error", title, className, children, ...props }: NoticeProps) {
  const Icon = icons[tone ?? "error"]
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(noticeVariants({ tone }), className)}
      {...props}
    >
      <Icon aria-hidden="true" className="mt-px size-4 shrink-0" />
      <div className="min-w-0 space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        <div className="text-ink [overflow-wrap:anywhere]">{children}</div>
      </div>
    </div>
  )
}

export { Notice }
