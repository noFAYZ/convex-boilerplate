import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "bg-input dark:bg-input/20 border-border/30 focus-visible:border-ring focus-visible:ring-ring/10 aria-invalid:ring-destructive/10 dark:aria-invalid:ring-destructive/10 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-md border transition-colors focus-visible:ring-2 aria-invalid:ring-2 file:text-foreground placeholder:text-muted-foreground w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        xs: "h-6 px-2 py-1 text-xs file:h-4 file:text-[0.625rem] file:font-medium",
        sm: "h-7 px-2 py-1.5 text-xs/relaxed file:h-5 file:text-xs/relaxed file:font-medium",
        md: "h-8 px-2.5 py-1.5 text-sm/relaxed file:h-6 file:text-xs/relaxed file:font-medium",
        default: "h-10 px-3 py-2 text-sm/relaxed file:h-6 file:text-xs/relaxed file:font-medium md:text-sm/relaxed",
        lg: "h-10 px-3 py-2 text-base/relaxed file:h-7 file:text-sm/relaxed file:font-medium",
        xl: "h-12 px-4 py-2.5 text-base/relaxed file:h-8 file:text-sm/relaxed file:font-medium",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

interface InputProps
  extends React.ComponentProps<"input">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, ...props }, ref) => {
    return (
      <InputPrimitive
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(inputVariants({ size, className }))}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
