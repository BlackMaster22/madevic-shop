"use client";

import { useDroppable } from "@dnd-kit/core";
import { clsx } from "clsx";
import KanbanCard from "@/components/admin/KanbanCard";
import type { Order, OrderStatus } from "@/types/database";

type OrderWithProfile = Order & {
    profile: { full_name: string; email: string };
};

interface Props {
    id: OrderStatus;
    label: string;
    color: string;
    orders: OrderWithProfile[];
}

export default function KanbanColumn({ id, label, color, orders }: Props) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div className="flex-shrink-0 w-72">
            {/* Header de columna */}
            <div
                className="flex items-center gap-2 mb-3 px-1"
            >
                <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: color }}
                />
                <h3 className="text-sm font-semibold text-[var(--color-on-surface)]">
                    {label}
                </h3>
                <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]">
                    {orders.length}
                </span>
            </div>

            {/* Zona droppable */}
            <div
                ref={setNodeRef}
                className={clsx(
                    "kanban-column rounded-xl p-2 space-y-2 min-h-32 transition-colors duration-150",
                    "bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]",
                    isOver && "bg-[var(--color-surface)] border-[var(--color-secondary)] is-over"
                )}
            >
                {orders.length === 0 ? (
                    <div className="flex items-center justify-center h-24 text-xs text-[var(--color-on-surface-variant)] text-center px-4">
                        Arrastra pedidos aquí
                    </div>
                ) : (
                    orders.map((order) => (
                        <KanbanCard key={order.id} order={order} />
                    ))
                )}
            </div>
        </div>
    );
}