"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MessageSquare, Package, X, Save } from "lucide-react";
import { clsx } from "clsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/ui/Badge";
import type { Order } from "@/types/database";
import toast from "react-hot-toast";

type OrderWithProfile = Order & {
    profile: { full_name: string; email: string };
};

interface Props {
    order: OrderWithProfile;
    isDragging?: boolean;
}

export default function KanbanCard({ order, isDragging = false }: Props) {
    const [expanded, setExpanded] = useState(false);
    const [adminNote, setAdminNote] = useState(order.admin_notes ?? "");
    const [saving, setSaving] = useState(false);

    const supabase = createClient();

    const { attributes, listeners, setNodeRef, transform, isDragging: dragging } =
        useDraggable({ id: order.id });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    const totalItems = order.order_items?.reduce(
        (sum, item) => sum + ((item as unknown as { quantity: number }).quantity ?? 0),
        0
    ) ?? 0;

    const handleSaveNote = async () => {
        setSaving(true);
        const { error } = await supabase
            .from("orders")
            .update({ admin_notes: adminNote || null } as never)
            .eq("id", order.id);

        if (error) {
            toast.error("Error al guardar la nota");
        } else {
            toast.success("Nota guardada");
            setExpanded(false);
        }
        setSaving(false);
    };

    return (
        <>
            {/* Tarjeta */}
            <div
                ref={setNodeRef}
                style={style}
                className={clsx(
                    "bg-[var(--color-surface-bright)] rounded-xl border border-[var(--color-outline-variant)]",
                    "shadow-[var(--shadow-card)] transition-shadow duration-200 select-none",
                    (dragging || isDragging) && "opacity-50 shadow-[var(--shadow-card-hover)]"
                )}
            >
                <div className="p-3">
                    {/* Handle drag + número */}
                    <div className="flex items-center gap-2 mb-2">
                        <button
                            {...attributes}
                            {...listeners}
                            className="text-[var(--color-outline)] hover:text-[var(--color-on-surface-variant)] cursor-grab active:cursor-grabbing touch-none"
                            aria-label="Arrastrar"
                        >
                            <GripVertical size={16} />
                        </button>
                        <span className="font-mono text-xs font-bold text-[var(--color-secondary)]">
                            {order.order_number}
                        </span>
                        <StatusBadge status={order.status} className="ml-auto text-[10px] py-0" />
                    </div>

                    {/* Cliente */}
                    <div className="mb-2">
                        <p className="text-sm font-medium text-[var(--color-on-surface)] truncate">
                            {order.profile?.full_name ?? "Sin nombre"}
                        </p>
                        <p className="text-xs text-[var(--color-on-surface-variant)] truncate">
                            {order.profile?.email}
                        </p>
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center justify-between text-xs text-[var(--color-on-surface-variant)]">
                        <span className="flex items-center gap-1">
                            <Package size={12} />
                            {totalItems} {totalItems === 1 ? "producto" : "productos"}
                        </span>
                        <span>
                            {format(new Date(order.created_at), "d MMM", { locale: es })}
                        </span>
                    </div>

                    {/* Total */}
                    {order.total_amount !== null && (
                        <p className="text-sm font-bold text-[var(--color-primary)] mt-2">
                            ${order.total_amount.toFixed(2)}
                        </p>
                    )}

                    {/* Botón nota */}
                    <button
                        onClick={() => setExpanded(true)}
                        className="mt-2 w-full flex items-center gap-1.5 text-xs text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)] transition-colors py-1"
                    >
                        <MessageSquare size={12} />
                        {order.admin_notes ? "Ver / editar nota" : "Añadir nota al cliente"}
                    </button>
                </div>
            </div>

            {/* Modal nota */}
            {expanded && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="overlay"
                        onClick={() => setExpanded(false)}
                    />
                    <div className="relative z-50 w-full max-w-md bg-[var(--color-surface-bright)] rounded-2xl shadow-[var(--shadow-modal)] p-6 animate-[scale-in_0.2s_ease-out]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-display font-bold text-[var(--color-primary)]">
                                Nota — {order.order_number}
                            </h3>
                            <button
                                onClick={() => setExpanded(false)}
                                className="btn btn-ghost btn-sm p-1.5"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Nota del cliente */}
                        {order.client_notes && (
                            <div className="mb-4 p-3 rounded-xl bg-[var(--color-surface-container)]">
                                <p className="text-xs font-medium text-[var(--color-on-surface-variant)] mb-1">
                                    Nota del cliente:
                                </p>
                                <p className="text-sm text-[var(--color-on-surface)]">
                                    {order.client_notes}
                                </p>
                            </div>
                        )}

                        {/* Nota del admin */}
                        <div className="mb-4">
                            <label className="label">
                                Respuesta al cliente
                            </label>
                            <textarea
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                className="input resize-none"
                                rows={4}
                                placeholder="Escribe una nota visible para el cliente..."
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setExpanded(false)}
                                className="btn btn-ghost btn-md"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveNote}
                                disabled={saving}
                                className="btn btn-primary btn-md"
                            >
                                <Save size={16} />
                                {saving ? "Guardando..." : "Guardar nota"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}