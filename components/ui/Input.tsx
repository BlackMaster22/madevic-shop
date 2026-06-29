import { type InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, icon, className, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="label">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={clsx(
                            "input",
                            icon && "pl-10",
                            error && "input-error",
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && <span className="label-error">{error}</span>}
                {hint && !error && (
                    <span className="block text-xs text-[var(--color-on-surface-variant)] mt-1">
                        {hint}
                    </span>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
export default Input;