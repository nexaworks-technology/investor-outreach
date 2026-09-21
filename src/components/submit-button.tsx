"use client"

import { useFormStatus } from "react-dom"
import { buttonVariants } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { type ComponentProps } from "react"
import { cn } from "@/lib/utils"

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function SubmitButton({
  children,
  className,
  formAction,
  variant = "default",
  size = "default",
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
    >
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? "Please wait..." : children}
    </button>
  )
}
