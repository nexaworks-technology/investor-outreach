"use client"

import { useFormStatus } from "react-dom"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { type ComponentProps } from "react"
import { type VariantProps } from "class-variance-authority"

type SubmitButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants>

export function SubmitButton({
  children,
  className,
  formAction,
  variant,
  size,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      {...props}
      type="submit"
      formAction={formAction as any}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={pending || props.disabled}
      data-slot="button"
    >
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? "Please wait..." : children}
    </button>
  )
}
