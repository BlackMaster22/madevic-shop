"use client";

import { useState, useCallback } from "react";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
    closestCorners,
} from "@dnd-kit/core";
import { createClient } from "@/lib/supabase/client";
import KanbanColumn from "@/components/admin/KanbanColumn";
import KanbanCard from "@/components/admin/KanbanCard";
import type { Order, OrderStatus } from "@/types/database";
import toast from "react-hot-toast";

type OrderWithProfile = Order & {
    profile: { full_name: string; email: string };
};

interface Props {
    initialColumns: Record<OrderStatus, OrderWithProfile[]>;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
    recibido: { label: "Recibido", color: "var(--color-status-recibido-border)" },
    en_proceso: { label: "En proceso", color: "var(--color-status-en-proceso-border)" },
    preparando: { label: "Preparando", color: "var(--color-status-preparando-border)" },
    listo: { label: "Listo", color: "var(--color-status-listo-border)" },
    entregado: { label: "Entregado", color: "var(--color-status-entregado-border)" },
    cancelado: { label: "Cancelado", color: "var(--color-status-cancelado-border)" },
};

// Estados que disparan notificaciones al cliente
const NOTIFY_STATUSES: OrderStatus[] = ["recibido", "listo", "entregado", "cancelado"];

export default function KanbanBoard({ initialColumns }: Props) {
    const [columns, setColumns] = useState(initialColumns);
    const [activeOrder, setActiveOrder] = useState<OrderWithProfile | null>(null);
    const supabase = createClient();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    );

    // Encontrar en qué columna está un pedido
    const findColumn = useCallback(
        (orderId: string): OrderStatus | null => {
            for (const [status, orders] of Object.entries(columns)) {
                if (orders.find((o) => o.id === orderId)) {
                    return status as OrderStatus;
                }
            }
            return null;
        },
        [columns]
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const sourceCol = findColumn(active.id as string);
        if (!sourceCol) return;
        const order = columns[sourceCol].find((o) => o.id === active.id);
        if (order) setActiveOrder(order);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveOrder(null);

        if (!over) return;

        const sourceStatus = findColumn(active.id as string);
        const targetStatus = over.id as OrderStatus;

        if (!sourceStatus || sourceStatus === targetStatus) return;

        const order = columns[sourceStatus].find((o) => o.id === active.id);
        if (!order) return;

        // Actualizar estado local optimistamente
        setColumns((prev) => {
            const updated = { ...prev };
            updated[sourceStatus] = updated[sourceStatus].filter(
                (o) => o.id !== active.id
            );
            updated[targetStatus] = [
                { ...order, status: targetStatus },
                ...updated[targetStatus],
            ];
            return updated;
        });

        // Actualizar en Supabase
        const { error } = await supabase
            .from("orders")
            .update({ status: targetStatus } as never)
            .eq("id", order.id);

        if (error) {
            toast.error("Error al actualizar el estado");
            // Revertir
            setColumns((prev) => {
                const reverted = { ...prev };
                reverted[targetStatus] = reverted[targetStatus].filter(
                    (o) => o.id !== active.id
                );
                reverted[sourceStatus] = [
                    { ...order, status: sourceStatus },
                    ...reverted[sourceStatus],
                ];
                return reverted;
            });
            return;
        }

        toast.success(
            `Pedido ${order.order_number} → ${STATUS_CONFIG[targetStatus].label}`
        );

        // Notificar si es estado clave
        if (NOTIFY_STATUSES.includes(targetStatus)) {
            await fetch("/api/notify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: order.id,
                    status: targetStatus,
                }),
            });
        }
    };

    const statuses = Object.keys(STATUS_CONFIG) as OrderStatus[];

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-200px)]">
                {statuses.map((status) => (
                    <KanbanColumn
                        key={status}
                        id={status}
                        label={STATUS_CONFIG[status].label}
                        color={STATUS_CONFIG[status].color}
                        orders={columns[status] ?? []}
                    />
                ))}
            </div>

            {/* Overlay — tarjeta que se arrastra */}
            <DragOverlay>
                {activeOrder && (
                    <div className="opacity-90 rotate-2 scale-105">
                        <KanbanCard order={activeOrder} isDragging />
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}