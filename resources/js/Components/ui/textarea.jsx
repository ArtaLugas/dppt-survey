import * as React from "react";
import PropTypes from "prop-types";
import { cn } from "@/lib/utils";

/**
 * Komponen Textarea kustom dengan gaya dasar Shadcn UI.
 * Menggunakan React.forwardRef untuk memungkinkan akses ke DOM element.
 * * @param {Object} props - Properti komponen.
 * @param {string} [props.className] - Class CSS tambahan untuk styling.
 * @param {React.Ref<HTMLTextAreaElement>} ref - Ref untuk elemen textarea.
 */
const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

// --- Validasi Runtime (Strong Typing) ---
Textarea.propTypes = {
  /** Class CSS tambahan dari Tailwind */
  className: PropTypes.string,
  /** Placeholder teks di dalam textarea */
  placeholder: PropTypes.string,
  /** Status apakah field dinonaktifkan */
  disabled: PropTypes.bool,
  /** Event handler saat nilai berubah */
  onChange: PropTypes.func,
  /** Nilai dari textarea */
  value: PropTypes.string,
};

export { Textarea };
