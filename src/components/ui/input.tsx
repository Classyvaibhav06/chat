import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-[8px] border border-linen-border bg-parchment px-3 py-1.5 text-sm shadow-subtle transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-dim-gray focus:outline-none focus:border-stone focus:ring-1 focus:ring-indigo-accent disabled:cursor-not-allowed disabled:opacity-50 text-charcoal",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
