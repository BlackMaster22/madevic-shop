"use client";

import { clsx } from "clsx";

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
    disabled?: boolean;
}

export default function Toggle({
    checked,
    onChange,
    label,
    description,
    disabled = false,
}: ToggleProps) {
    return (
        <div className="flex items-start gap-3">
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={clsx(
                    "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full",
                    "border-2 border-transparent transition-colors duration-200 ease-in-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)]",
                    "focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
                    checked
                        ? "bg-[var(--color-secondary)]"
                        : "bg-[var(--color-outline-variant)]"
                )}
            >
                <span
                    className={clsx(
                        "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm",
                        "transform transition-transform duration-200 ease-in-out",
                        checked ? "translate-x-5" : "translate-x-0"
                    )}
                />
            </button>
            {(label || description) && (
                <div className="flex flex-col">
                    {label && (
                        <span className="text-sm font-medium text-[var(--color-on-surface)]">
                            {label}
                        </span>
                    )}
                    {description && (
                        <span className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">
                            {description}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}