"use client"

import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const Dialog = DialogPrimitive.Root
const DialogClose = DialogPrimitive.Close
const AlertDialog = AlertDialogPrimitive.Root
const AlertDialogClose = AlertDialogPrimitive.Close

const backdropClassName =
  "fixed inset-0 z-50 bg-scrim transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"

/**
 * Large dialog for forms. On phones it becomes a near full-height sheet so
 * fields and the keyboard have room; from `sm` up it is a centred panel.
 */
function DialogContent({ className, children, ...props }: DialogPrimitive.Popup.Props) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop className={backdropClassName} />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed inset-x-0 top-3 bottom-0 z-50 flex flex-col overflow-hidden rounded-t-panel bg-surface text-ink shadow-overlay outline-none",
          "transition-[opacity,translate,scale] duration-200 ease-out data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
          "max-sm:data-[ending-style]:translate-y-8 max-sm:data-[starting-style]:translate-y-8",
          "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-h-[min(100dvh-4rem,50rem)] sm:w-[min(100vw-3rem,52rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-panel",
          "sm:data-[ending-style]:scale-[0.98] sm:data-[starting-style]:scale-[0.98]",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  )
}

function DialogHeader({
  title,
  description,
  closeLabel,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  closeLabel: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-7 sm:py-5">
      <div className="min-w-0 space-y-1">
        <DialogPrimitive.Title className="font-display text-display-sm font-medium">{title}</DialogPrimitive.Title>
        {description && (
          <DialogPrimitive.Description className="text-sm text-ink-muted">{description}</DialogPrimitive.Description>
        )}
      </div>
      <DialogPrimitive.Close
        aria-label={closeLabel}
        render={<Button variant="ghost" size="icon-sm" className="-mr-2 shrink-0" />}
      >
        <XIcon aria-hidden="true" className="size-5" />
      </DialogPrimitive.Close>
    </div>
  )
}

function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6", className)} {...props} />
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex justify-end gap-2 border-t border-line bg-surface px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7 sm:pb-4",
        className
      )}
      {...props}
    />
  )
}

/** Small centred dialog for confirmations such as deleting an item. */
function AlertDialogContent({
  title,
  description,
  children,
  className,
  ...props
}: AlertDialogPrimitive.Popup.Props & { title: React.ReactNode; description: React.ReactNode }) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Backdrop className={backdropClassName} />
      <AlertDialogPrimitive.Popup
        className={cn(
          "fixed top-1/2 left-1/2 z-50 w-[min(100vw-2rem,27rem)] -translate-x-1/2 -translate-y-1/2 rounded-panel bg-surface p-6 text-ink shadow-overlay outline-none",
          "transition-[opacity,scale] duration-200 ease-out data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0",
          className
        )}
        {...props}
      >
        <AlertDialogPrimitive.Title className="font-display text-display-sm font-medium">{title}</AlertDialogPrimitive.Title>
        <AlertDialogPrimitive.Description className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted [overflow-wrap:anywhere]">
          {description}
        </AlertDialogPrimitive.Description>
        {children}
      </AlertDialogPrimitive.Popup>
    </AlertDialogPrimitive.Portal>
  )
}

export {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
}
