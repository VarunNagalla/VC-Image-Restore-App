import * as React from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "default" | "secondary" | "ghost" | "outline" | "destructive";
type Size = "default" | "sm" | "lg" | "icon";

const variantClasses: Record<Variant, string> = {
  default:
    "bg-primary text-primary-foreground hover:opacity-90 shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.6)]",
  secondary: "bg-surface-muted text-foreground hover:bg-muted",
  ghost: "hover:bg-surface-muted text-foreground",
  outline: "border border-border bg-transparent hover:bg-surface-muted text-foreground",
  destructive: "bg-destructive text-white hover:opacity-90",
};

const sizeClasses: Record<Size, string> = {
  default: "h-10 px-4 text-sm",
  sm: "h-8 px-3 text-xs",
  lg: "h-12 px-6 text-base",
  icon: "h-9 w-9",
};

export function buttonClasses(variant: Variant = "default", size: Size = "default", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
    variantClasses[variant],
    sizeClasses[size],
    className
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return <button ref={ref} className={buttonClasses(variant, size, className)} {...props} />;
  }
);
Button.displayName = "Button";
