import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

const variants = cva(
  "inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/30",
        accent: "bg-accent text-accent-foreground hover:brightness-110 shadow-lg shadow-accent/30",
        success:
          "bg-success text-success-foreground hover:brightness-110 shadow-lg shadow-success/30",
        danger:
          "bg-destructive text-destructive-foreground hover:brightness-110 shadow-lg shadow-destructive/30",
        ghost: "bg-card text-foreground hover:bg-muted border border-border",
        outline: "bg-transparent text-foreground hover:bg-card border-2 border-border",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-12 px-5 text-base",
        lg: "h-16 px-8 text-xl",
        xl: "h-20 px-10 text-2xl",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface BigButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof variants> {}

export const BigButton = forwardRef<HTMLButtonElement, BigButtonProps>(
  ({ className, variant, size, onMouseDown, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(variants({ variant, size }), className)}
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown?.(event);
      }}
      {...props}
    />
  ),
);
BigButton.displayName = "BigButton";
