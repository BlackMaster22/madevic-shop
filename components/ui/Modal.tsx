"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
}

const SIZE_MAP = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
};

export default function Modal({
    open,
    onClose,
    title,
    children,
    size = "md",
}: ModalProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

    // Cerrar con Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open, onClose]);

    // Bloquear scroll del body
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="overlay" onClick={onClose} />

            {/* Dialog */}
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? "modal-title" : undefined}
                className={clsx(
                    "relative z-50 w-full bg-[var(--color-surface-bright)] rounded-2xl",
                    "shadow-[var(--shadow-modal)] animate-[scale-in_0.2s_ease-out]",
                    SIZE_MAP[size]
                )}
            >
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-outline-variant)]">
                        <h2
                            id="modal-title"
                            className="text-lg font-semibold text-[var(--color-primary)] font-display"
                        >
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="btn btn-ghost btn-sm p-1.5 rounded-lg"
                            aria-label="Cerrar"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    );
}