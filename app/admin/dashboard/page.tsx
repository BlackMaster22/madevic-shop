import { createClient } from "@/lib/supabase/server";
import {
    ShoppingBag,
    DollarSign,
    Clock,
    TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/Badge";
import type { Order, OrderStatus } from "@/types/database";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const metadata = { title: "Dashboard" };

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    sub?: string;
    color: string;
}

function StatCard({ title, value, icon, sub, color }: StatCardProps) {
    return (
        <div className="card p-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-[var(--color-on-surface-variant)] mb-1">
                        {title}
                    </p>
                    <p className="text-3xl font-display font-bold text-[var(--color-primary)]">
                        {value}
                    </p>
                    {sub && (
                        <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
                            {sub}
                        </p>
                    )}
                </div>
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: color }}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default async function DashboardPage() {
    const supabase = await createClient();

    // ── Totales ─────────────────────────────────────────────────
    const { count: totalOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

    const { count: todayOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .gte("created_at", new Date().toISOString().split("T")[0]);

    const { count: pendingOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .in("status", ["recibido", "en_proceso", "preparando"]);

    // Ingresos totales (solo pedidos con precio)
    const { data: revenueRaw } = await supabase
        .from("orders")
        .select("total_amount")
        .not("total_amount", "is", null)
        .neq("status", "cancelado");

    const totalRevenue = (revenueRaw ?? []).reduce(
        (sum, o) => sum + ((o as { total_amount: number }).total_amount ?? 0),
        0
    );

    // ── Últimos pedidos ─────────────────────────────────────────
    const { data: recentRaw } = await supabase
        .from("orders")
        .select("*, profile:profiles(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(8);

    const recentOrders = (recentRaw ?? []) as unknown as (Order & {
        profile: { full_name: string; email: string };
    })[];

    // ── Productos más pedidos ───────────────────────────────────
    const { data: topRaw } = await supabase
        .from("order_items")
        .select("product_snapshot, quantity")
        .limit(100);

    // Agrupar por nombre de producto
    const productMap = new Map<string, number>();
    (topRaw ?? []).forEach((item) => {
        const snap = item as unknown as {
            product_snapshot: { name: string };
            quantity: number;
        };
        const name = snap.product_snapshot?.name ?? "Sin nombre";
        productMap.set(name, (productMap.get(name) ?? 0) + snap.quantity);
    });

    const topProducts = Array.from(productMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // ── Pedidos por estado ──────────────────────────────────────
    const STATUS_LIST: OrderStatus[] = [
        "recibido", "en_proceso", "preparando", "listo", "entregado", "cancelado",
    ];

    const statusCounts = await Promise.all(
        STATUS_LIST.map(async (status) => {
            const { count } = await supabase
                .from("orders")
                .select("*", { count: "exact", head: true })
                .eq("status", status);
            return { status, count: count ?? 0 };
        })
    );

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-[var(--color-primary)]">
                    Dashboard
                </h1>
                <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
                    Resumen general de la tienda
                </p>
            </div>

            {/* ── Stats ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                <StatCard
                    title="Pedidos hoy"
                    value={todayOrders ?? 0}
                    icon={<ShoppingBag size={22} className="text-[var(--color-secondary)]" />}
                    color="var(--color-secondary-fixed)"
                    sub={`${totalOrders ?? 0} en total`}
                />
                <StatCard
                    title="Pedidos pendientes"
                    value={pendingOrders ?? 0}
                    icon={<Clock size={22} className="text-[var(--color-status-en-proceso-text)]" />}
                    color="var(--color-status-en-proceso)"
                    sub="Recibido, En proceso, Preparando"
                />
                <StatCard
                    title="Ingresos totales"
                    value={`$${totalRevenue.toFixed(2)}`}
                    icon={<DollarSign size={22} className="text-[var(--color-status-listo-text)]" />}
                    color="var(--color-status-listo)"
                    sub="Solo pedidos con precio definido"
                />
                <StatCard
                    title="Total pedidos"
                    value={totalOrders ?? 0}
                    icon={<TrendingUp size={22} className="text-[var(--color-primary)]" />}
                    color="var(--color-primary-fixed)"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* ── Últimos pedidos ───────────────────────────────── */}
                <div className="xl:col-span-2 card overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-outline-variant)]">
                        <h2 className="font-semibold text-[var(--color-on-surface)]">
                            Últimos pedidos
                        </h2>
                        <Link
                            href="/admin/pedidos"
                            className="text-sm text-[var(--color-secondary)] hover:underline"
                        >
                            Ver Kanban →
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Pedido</th>
                                    <th>Cliente</th>
                                    <th>Estado</th>
                                    <th>Fecha</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td>
                                            <Link
                                                href={`/admin/pedidos/${order.id}`}
                                                className="font-mono text-sm font-medium text-[var(--color-secondary)] hover:underline"
                                            >
                                                {order.order_number}
                                            </Link>
                                        </td>
                                        <td>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {order.profile?.full_name ?? "—"}
                                                </p>
                                                <p className="text-xs text-[var(--color-on-surface-variant)]">
                                                    {order.profile?.email}
                                                </p>
                                            </div>
                                        </td>
                                        <td>
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="text-sm text-[var(--color-on-surface-variant)]">
                                            {format(new Date(order.created_at), "d MMM", { locale: es })}
                                        </td>
                                        <td className="text-sm font-medium">
                                            {order.total_amount !== null
                                                ? `$${order.total_amount.toFixed(2)}`
                                                : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Columna derecha ───────────────────────────────── */}
                <div className="space-y-6">

                    {/* Pedidos por estado */}
                    <div className="card p-6">
                        <h2 className="font-semibold text-[var(--color-on-surface)] mb-4">
                            Por estado
                        </h2>
                        <div className="space-y-2">
                            {statusCounts.map(({ status, count }) => (
                                <div key={status} className="flex items-center justify-between">
                                    <StatusBadge status={status as OrderStatus} />
                                    <span className="text-sm font-semibold text-[var(--color-on-surface)]">
                                        {count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top productos */}
                    {topProducts.length > 0 && (
                        <div className="card p-6">
                            <h2 className="font-semibold text-[var(--color-on-surface)] mb-4">
                                Más pedidos
                            </h2>
                            <div className="space-y-3">
                                {topProducts.map(([name, qty], i) => (
                                    <div key={name} className="flex items-center gap-3">
                                        <span className="w-5 h-5 rounded-full bg-[var(--color-primary-fixed)] text-[var(--color-primary)] text-xs font-bold flex items-center justify-center flex-shrink-0">
                                            {i + 1}
                                        </span>
                                        <span className="text-sm text-[var(--color-on-surface)] flex-1 truncate">
                                            {name}
                                        </span>
                                        <span className="text-xs font-semibold text-[var(--color-secondary)]">
                                            ×{qty}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}