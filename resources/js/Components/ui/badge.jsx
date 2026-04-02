import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  // Base styles: Tipografi rapat, uppercase, dan tracking wider untuk kesan formal
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Professional Info (Blue)
        default:
          "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 shadow-sm",

        // Neutral/Draft (Slate)
        secondary:
          "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100",

        // Critical/Error (Red)
        destructive:
          "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",

        // Clean/Minimalist
        outline:
          "text-slate-600 border-slate-300 bg-transparent hover:bg-slate-50",

        // Success/Verified (Emerald)
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",

        // Pending/Attention (Amber)
        warning:
          "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",

        // Locked/Premium (Indigo)
        premium:
          "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
