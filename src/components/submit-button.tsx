"use client"

import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { type ComponentProps } from "react"

export function SubmitButton({
  children,
  className,
  formAction,
  ...props
}: ComponentProps<typeof Button>) {
  const { pending } = useFormStatus()

  return (
    <Button
      {...props}
      type="submit"
      formAction={formAction}
      className={className}
      disabled={pending || props.disabled}
    >
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? "Please wait..." : children}
    </Button>
  )
}
