import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "h-5 gap-1 rounded-full border border-transparent px-1.5 py-0.5 text-[0.625rem] font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-2.5! inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive overflow-hidden group/badge",
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

        // ✅ NEW STATUS VARIANTS
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
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
