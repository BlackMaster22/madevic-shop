import { type SelectHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";

interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    hint?: string;
    options: SelectOption[];
    placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, hint, options, placeholder, className, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="label">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        id={inputId}
                        className={clsx(
                            "input appearance-none pr-10 cursor-pointer",
                            error && "input-error",
                            className
                        )}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((opt) => (
                            <option
                                key={opt.value}
                                value={opt.value}
                                disabled={opt.disabled}
                            >
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] pointer-events-none"
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

Select.displayName = "Select";
export default Select;