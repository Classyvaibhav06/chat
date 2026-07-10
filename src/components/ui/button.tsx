import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-accent disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        // Dark Pill Button: Background rgba(0,0,0,0.88) (#1c1c1c at 88%), text #fcfbf8, border-radius 9999px
        default:
          "bg-charcoal/90 text-parchment shadow-sm hover:bg-charcoal rounded-full",
        
        // Outlined Pill Button: Transparent background, charcoal text, 1px solid #eceae4 border, border-radius 9999px
        outline:
          "border border-linen-border bg-transparent text-charcoal hover:bg-warm-sand hover:border-stone rounded-full",
        
        // Ghost Nav Button: Transparent background, #1c1c1c text, no border, 0px border-radius. On hover, text color shifts.
        ghost: 
          "bg-transparent text-charcoal hover:text-ink rounded-none border-none p-0",
        
        // Secondary Pill variant (shorthand for outline/sand mix)
        secondary:
          "bg-warm-sand text-charcoal hover:bg-stone/20 border border-linen-border rounded-full",

        // Link variant
        link: 
          "text-indigo-accent underline-offset-4 hover:underline",

        // Hero Send button: Rainbow Circle
        gradientCircle:
          "hero-gradient-horizon text-parchment rounded-full aspect-square p-0 flex items-center justify-center hover:scale-105 active:scale-95 shadow-md border-none",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-8",
        icon: "h-9 w-9",
        ghostNav: "py-1 px-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
