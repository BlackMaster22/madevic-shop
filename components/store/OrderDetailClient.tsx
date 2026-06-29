"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Package, MapPin, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { StatusBadge } from "@/components/ui/Badge";
import { useOrderRealtime } from "@/hooks/useOrderRealtime";
import type { Order, OrderStatusLog, OrderStatus } from "@/types/database";

interface Props {
    order: Order;
    statusLog: OrderStatusLog[];
}

const STATUS_STEPS: OrderStatus[] = [
    "recibido",
    "en_proceso",
    "preparando",
    "listo",
    "entregado",
];

const STATUS_LABELS: Record<OrderStatus, string> = {
    recibido: "Recibido",
    en_proceso: "En proceso",
    preparando: "Preparando",
    listo: "Listo para entrega",
    entregado: "Entregado",
    cancelado: "Cancelado",
};

export default function OrderDetailClient({ order: initialOrder, statusLog: initialLog }: Props) {
    // Realtime — el estado se actualiza automáticamente
    const { order, statusLog } = useOrderRealtime(initialOrder.id);

    const currentOrder = order ?? initialOrder;
    const currentLog = statusLog.length > 0 ? statusLog : initialLog;

    const isCancelled = currentOrder.status === "cancelado";
    const currentStep = isCancelled
        ? -1
        : STATUS_STEPS.indexOf(currentOrder.status);

    return (
        <div>
            {/* Breadcrumb */}
            <Link
                href="/cuenta/pedidos"
                className="inline-flex items-center gap-2 text-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors mb-8"
            >
                <ArrowLeft size={16} />
                Volver a mis pedidos
            </Link>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-display font-bold text-[var(--color-primary)]">
                        Pedido {currentOrder.order_number}
                    </h1>
                    <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
                        Realizado el{" "}
                        {format(new Date(currentOrder.created_at), "d 'de' MMMM 'de' yyyy", {
                            locale: es,
                        })}
                    </p>
                </div>
                <StatusBadge status={currentOrder.status} />
            </div>

            <div className="space-y-6">

                {/* ── Tracker de estado ────────────────────────────── */}
                {!isCancelled ? (
                    <div className="card p-6">
                        <h2 className="font-semibold text-[var(--color-on-surface)] mb-6">
                            Estado del pedido
                        </h2>
                        <div className="relative">
                            {/* Línea de progreso */}
                            <div className="absolute top-4 left-4 right-4 h-0.5 bg-[var(--color-outline-variant)]" />
                            <div
                                className="absolute top-4 left-4 h-0.5 bg-[var(--color-secondary)] transition-all duration-700"
                                style={{
                                    width: currentStep >= 0
                                        ? `${(currentStep / (STATUS_STEPS.length - 1)) * (100 - 8)}%`
                                        : "0%",
                                }}
                            />

                            {/* Pasos */}
                            <div className="relative flex justify-between">
                                {STATUS_STEPS.map((step, i) => {
                                    const done = i <= currentStep;
                                    const current = i === currentStep;
                                    return (
                                        <div key={step} className="flex flex-col items-center gap-2">
                                            <div
                                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 ${done
                                                        ? "bg-[var(--color-secondary)] border-[var(--color-secondary)]"
                                                        : "bg-[var(--color-surface-bright)] border-[var(--color-outline-variant)]"
                                                    } ${current ? "ring-4 ring-[var(--color-secondary-fixed)]" : ""}`}
                                            >
                                                {done && (
                                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className={`text-xs text-center max-w-16 leading-tight ${done
                                                    ? "text-[var(--color-secondary)] font-medium"
                                                    : "text-[var(--color-on-surface-variant)]"
                                                }`}>
                                                {STATUS_LABELS[step]}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="card p-6 border-[var(--color-error)] bg-[var(--color-error-container)]">
                        <p className="font-semibold text-[var(--color-error-on-container)]">
                            Este pedido fue cancelado
                        </p>
                    </div>
                )}

                {/* ── Productos del pedido ──────────────────────────── */}
                <div className="card p-6">
                    <h2 className="font-semibold text-[var(--color-on-surface)] mb-4">
                        Productos
                    </h2>
                    <div className="space-y-3">
                        {currentOrder.order_items?.map((item) => (
                            <div
                                key={item.id}
                                className="flex gap-3 p-3 rounded-xl bg-[var(--color-surface-container-low)]"
                            >
                                {/* Imagen */}
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-[var(--color-surface-container)] flex-shrink-0">
                                    {item.product_snapshot?.images?.[0] ? (
                                        <Image
                                            src={item.product_snapshot.images[0]}
                                            alt={item.product_snapshot.name}
                                            width={64}
                                            height={64}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package size={20} className="text-[var(--color-outline)]" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[var(--color-on-surface)] line-clamp-1">
                                        {item.product_snapshot?.name}
                                    </p>
                                    <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">
                                        Cantidad: {item.quantity}
                                    </p>
                                    {item.unit_price !== null && (
                                        <p className="text-sm font-semibold text-[var(--color-secondary)] mt-1">
                                            ${(item.unit_price * item.quantity).toFixed(2)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    {currentOrder.total_amount !== null && (
                        <div className="flex justify-between items-center pt-4 mt-4 border-t border-[var(--color-outline-variant)]">
                            <span className="font-medium text-[var(--color-on-surface)]">
                                Total
                            </span>
                            <span className="text-xl font-bold font-display text-[var(--color-primary)]">
                                ${currentOrder.total_amount.toFixed(2)}
                            </span>
                        </div>
                    )}
                </div>

                {/* ── Dirección de entrega ──────────────────────────── */}
                {currentOrder.shipping_address && (
                    <div className="card p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin size={18} className="text-[var(--color-secondary)]" />
                            <h2 className="font-semibold text-[var(--color-on-surface)]">
                                Dirección de entrega
                            </h2>
                        </div>
                        <p className="text-sm text-[var(--color-on-surface-variant)]">
                            {currentOrder.shipping_address.street}
                            {currentOrder.shipping_address.city &&
                                `, ${currentOrder.shipping_address.city}`}
                            {currentOrder.shipping_address.province &&
                                `, ${currentOrder.shipping_address.province}`}
                        </p>
                    </div>
                )}

                {/* ── Notas ─────────────────────────────────────────── */}
                {(currentOrder.client_notes || currentOrder.admin_notes) && (
                    <div className="card p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <MessageSquare size={18} className="text-[var(--color-secondary)]" />
                            <h2 className="font-semibold text-[var(--color-on-surface)]">
                                Notas
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {currentOrder.client_notes && (
                                <div className="p-3 rounded-xl bg-[var(--color-surface-container)]">
                                    <p className="text-xs font-medium text-[var(--color-on-surface-variant)] mb-1">
                                        Tu nota:
                                    </p>
                                    <p className="text-sm text-[var(--color-on-surface)]">
                                        {currentOrder.client_notes}
                                    </p>
                                </div>
                            )}
                            {currentOrder.admin_notes && (
                                <div className="p-3 rounded-xl bg-[var(--color-primary-fixed)]">
                                    <p className="text-xs font-medium text-[var(--color-primary-on-fixed-variant)] mb-1">
                                        Respuesta de MADEVIC:
                                    </p>
                                    <p className="text-sm text-[var(--color-primary-on-fixed)]">
                                        {currentOrder.admin_notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Historial de estados ──────────────────────────── */}
                {currentLog.length > 0 && (
                    <div className="card p-6">
                        <h2 className="font-semibold text-[var(--color-on-surface)] mb-4">
                            Historial
                        </h2>
                        <div className="space-y-3">
                            {currentLog.map((log) => (
                                <div key={log.id} className="flex gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[var(--color-secondary)] mt-1.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-[var(--color-on-surface)]">
                                            {log.old_status
                                                ? `${STATUS_LABELS[log.old_status]} → ${STATUS_LABELS[log.new_status]}`
                                                : STATUS_LABELS[log.new_status]}
                                        </p>
                                        <p className="text-xs text-[var(--color-on-surface-variant)]">
                                            {format(
                                                new Date(log.created_at),
                                                "d MMM yyyy, HH:mm",
                                                { locale: es }
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}