import { type TextareaHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, hint, className, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="label">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={inputId}
                    className={clsx(
                        "input resize-none",
                        error && "input-error",
                        className
                    )}
                    rows={4}
                    {...props}
                />
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

Textarea.displayName = "Textarea";
export default Textarea;