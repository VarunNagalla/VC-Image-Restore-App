import * as React from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "default" | "outline" | "success" | "warning";

const variantClasses: Record<Variant, string> = {
  default: "bg-primary/10 text-primary border-primary/20",
  outline: "bg-transparent text-muted-foreground border-border",
  success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
