import { type ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = "primary",
            size = "md",
            loading = false,
            fullWidth = false,
            disabled,
            children,
            className,
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={clsx(
                    "btn",
                    `btn-${variant}`,
                    `btn-${size}`,
                    fullWidth && "w-full",
                    className
                )}
                {...props}
            >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
export default Button;