import { clsx } from "clsx";
import type { OrderStatus } from "@/types/database";

// ── Badge de estado de pedido ─────────────────────────────────
interface StatusBadgeProps {
    status: OrderStatus;
    className?: string;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; dot: string }> = {
    recibido: { label: "Recibido", dot: "bg-[var(--color-status-recibido-text)]" },
    en_proceso: { label: "En proceso", dot: "bg-[var(--color-status-en-proceso-text)]" },
    preparando: { label: "Preparando", dot: "bg-[var(--color-status-preparando-text)]" },
    listo: { label: "Listo", dot: "bg-[var(--color-status-listo-text)]" },
    entregado: { label: "Entregado", dot: "bg-[var(--color-status-entregado-text)]" },
    cancelado: { label: "Cancelado", dot: "bg-[var(--color-status-cancelado-text)]" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status];
    return (
        <span className={clsx("badge-status", `badge-${status.replace("_", "-")}`, className)}>
            <span className={clsx("w-1.5 h-1.5 rounded-full", config.dot)} />
            {config.label}
        </span>
    );
}

// ── Badge genérico ────────────────────────────────────────────
interface BadgeProps {
    children: React.ReactNode;
    variant?: "default" | "success" | "warning" | "error" | "info";
    className?: string;
}

const BADGE_VARIANTS = {
    default: "bg-[var(--color-surface-container)] text-[var(--color-on-surface)] border-[var(--color-outline-variant)]",
    success: "bg-[var(--color-status-listo)] text-[var(--color-status-listo-text)] border-[var(--color-status-listo-border)]",
    warning: "bg-[var(--color-status-en-proceso)] text-[var(--color-status-en-proceso-text)] border-[var(--color-status-en-proceso-border)]",
    error: "bg-[var(--color-error-container)] text-[var(--color-error-on-container)] border-[var(--color-error)]",
    info: "bg-[var(--color-status-recibido)] text-[var(--color-status-recibido-text)] border-[var(--color-status-recibido-border)]",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
    return (
        <span
            className={clsx(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                BADGE_VARIANTS[variant],
                className
            )}
        >
            {children}
        </span>
    );
}