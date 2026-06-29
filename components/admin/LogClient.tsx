"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Search, Filter, Mail, Send } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import type { LogEntry } from "@/app/admin/log/page";
import type { Profile, OrderStatus } from "@/types/database";

interface Props {
    entries: LogEntry[];
    operadores: Pick<Profile, "id" | "full_name" | "email">[];
}

export default function LogClient({ entries, operadores }: Props) {
    const [search, setSearch] = useState("");
    const [opFilter, setOpFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const filtered = useMemo(() => {
        return entries.filter((entry) => {
            // Filtro búsqueda por número de pedido
            if (search) {
                const q = search.toLowerCase();
                const matchOrder = entry.order?.order_number
                    ?.toLowerCase()
                    .includes(q);
                const matchOp = entry.profile?.full_name
                    ?.toLowerCase()
                    .includes(q);
                if (!matchOrder && !matchOp) return false;
            }

            // Filtro por operador
            if (opFilter && entry.changed_by !== opFilter) return false;

            // Filtro por estado nuevo
            if (statusFilter && entry.new_status !== statusFilter) return false;

            // Filtro por fecha desde
            if (dateFrom) {
                const entryDate = new Date(entry.created_at);
                const from = new Date(dateFrom);
                if (entryDate < from) return false;
            }

            // Filtro por fecha hasta
            if (dateTo) {
                const entryDate = new Date(entry.created_at);
                const to = new Date(dateTo);
                to.setHours(23, 59, 59);
                if (entryDate > to) return false;
            }

            return true;
        });
    }, [entries, search, opFilter, statusFilter, dateFrom, dateTo]);

    const STATUS_OPTIONS: OrderStatus[] = [
        "recibido", "en_proceso", "preparando",
        "listo", "entregado", "cancelado",
    ];

    const clearFilters = () => {
        setSearch("");
        setOpFilter("");
        setStatusFilter("");
        setDateFrom("");
        setDateTo("");
    };

    const hasFilters = search || opFilter || statusFilter || dateFrom || dateTo;

    return (
        <div>
            {/* ── Filtros ──────────────────────────────────────────── */}
            <div className="card p-4 mb-5 space-y-3">
                <div className="flex flex-wrap gap-3">
                    {/* Búsqueda */}
                    <div className="relative flex-1 min-w-48">
                        <Search
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]"
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por pedido u operador..."
                            className="input pl-9 text-sm"
                        />
                    </div>

                    {/* Filtro operador */}
                    <select
                        value={opFilter}
                        onChange={(e) => setOpFilter(e.target.value)}
                        className="input w-auto cursor-pointer text-sm"
                    >
                        <option value="">Todos los operadores</option>
                        {operadores.map((op) => (
                            <option key={op.id} value={op.id}>
                                {op.full_name ?? op.email}
                            </option>
                        ))}
                    </select>

                    {/* Filtro estado */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input w-auto cursor-pointer text-sm"
                    >
                        <option value="">Todos los estados</option>
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                                {s.replace("_", " ")}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                    {/* Rango de fechas */}
                    <div className="flex items-center gap-2">
                        <Filter
                            size={14}
                            className="text-[var(--color-on-surface-variant)]"
                        />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="input w-auto text-sm cursor-pointer"
                        />
                        <span className="text-xs text-[var(--color-on-surface-variant)]">
                            hasta
                        </span>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="input w-auto text-sm cursor-pointer"
                        />
                    </div>

                    {/* Limpiar filtros */}
                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-xs text-[var(--color-error)] hover:underline"
                        >
                            Limpiar filtros
                        </button>
                    )}

                    <span className="ml-auto text-xs text-[var(--color-on-surface-variant)]">
                        {filtered.length} de {entries.length} registros
                    </span>
                </div>
            </div>

            {/* ── Tabla ────────────────────────────────────────────── */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Pedido</th>
                                <th>Operador</th>
                                <th>Cambio</th>
                                <th>Notificaciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="text-center py-12 text-sm text-[var(--color-on-surface-variant)]"
                                    >
                                        No hay registros con los filtros aplicados
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((entry) => (
                                    <tr key={entry.id}>
                                        {/* Fecha */}
                                        <td className="text-xs text-[var(--color-on-surface-variant)] whitespace-nowrap">
                                            <div>
                                                {format(
                                                    new Date(entry.created_at),
                                                    "d MMM yyyy",
                                                    { locale: es }
                                                )}
                                            </div>
                                            <div className="font-mono">
                                                {format(new Date(entry.created_at), "HH:mm:ss")}
                                            </div>
                                        </td>

                                        {/* Pedido */}
                                        <td>
                                            <span className="font-mono text-sm font-bold text-[var(--color-secondary)]">
                                                {entry.order?.order_number ?? "—"}
                                            </span>
                                        </td>

                                        {/* Operador */}
                                        <td>
                                            <div>
                                                <p className="text-sm font-medium text-[var(--color-on-surface)]">
                                                    {entry.profile?.full_name ?? "Sistema"}
                                                </p>
                                                <p className="text-xs text-[var(--color-on-surface-variant)]">
                                                    {entry.profile?.role === "admin_principal"
                                                        ? "Administrador"
                                                        : "Operador"}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Cambio de estado */}
                                        <td>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {entry.old_status && (
                                                    <>
                                                        <StatusBadge status={entry.old_status} />
                                                        <span className="text-[var(--color-outline)] text-xs">
                                                            →
                                                        </span>
                                                    </>
                                                )}
                                                <StatusBadge status={entry.new_status} />
                                            </div>
                                        </td>

                                        {/* Notificaciones */}
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    title="Email"
                                                    className={
                                                        entry.notified_email
                                                            ? "text-[var(--color-status-listo-text)]"
                                                            : "text-[var(--color-outline-variant)]"
                                                    }
                                                >
                                                    <Mail size={14} />
                                                </span>
                                                <span
                                                    title="Telegram"
                                                    className={
                                                        entry.notified_telegram
                                                            ? "text-[var(--color-status-listo-text)]"
                                                            : "text-[var(--color-outline-variant)]"
                                                    }
                                                >
                                                    <Send size={14} />
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}