import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "gap-1 rounded-full border border-transparent font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 overflow-hidden group/badge",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground [a]:hover:bg-primary/80",

        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",

        destructive:
          "bg-destructive/10 [a]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive dark:bg-destructive/20",

        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground bg-input/20 dark:bg-input/30",

        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",

        link:
          "text-primary underline-offset-4 hover:underline",

        success:
          "bg-lime-600 text-white font-semibold dark:text-emerald-400 [a]:hover:bg-emerald-500/20 border-emerald-500/20",

        warning:
          "bg-amber-500/10 text-amber-600 dark:text-amber-400 [a]:hover:bg-amber-500/20 border-amber-500/20",

        info:
          "bg-blue-500/70 text-white dark:text-blue-200 [a]:hover:bg-blue-500/20 border-blue-500/20",

        neutral:
          "bg-muted text-muted-foreground border-border",

        pending:
          "bg-purple-500/10 text-purple-600 dark:text-purple-400 [a]:hover:bg-purple-500/20 border-purple-500/20",

        premium:
          "bg-gradient-to-r from-amber-500 via-primary-500 to-amber-400 text-black font-semibold border-yellow-500/30 shadow",

        new:
          "bg-emerald-500 text-white font-semibold animate-pulse [a]:hover:bg-emerald-600 border-emerald-500/30",
      },

      size: {
        xs: "h-4 px-1 text-[0.55rem] [&>svg]:size-2",
        sm: "h-5 px-1.5 py-0.5 text-[0.625rem] [&>svg]:size-2.5",
        md: "h-6 px-2 text-xs [&>svg]:size-3",
        lg: "h-7 px-2.5 text-sm [&>svg]:size-3.5",
        xl: "h-8 px-2.5 text-md [&>svg]:size-4",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
)

function Badge({
  className,
  variant,
  size,
  render,
  ...props
}: useRender.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, size }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
      size,
    },
  })
}

export { Badge, badgeVariants }
