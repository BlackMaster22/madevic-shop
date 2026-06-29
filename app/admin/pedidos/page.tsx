import { createClient } from "@/lib/supabase/server";
import KanbanBoard from "@/components/admin/KanbanBoard";
import type { Order, OrderStatus } from "@/types/database";

export const metadata = { title: "Pedidos — Kanban" };

const STATUS_COLUMNS: OrderStatus[] = [
    "recibido",
    "en_proceso",
    "preparando",
    "listo",
    "entregado",
    "cancelado",
];

export default async function PedidosPage() {
    const supabase = await createClient();

    const { data: ordersRaw } = await supabase
        .from("orders")
        .select(`
      *,
      profile:profiles(full_name, email),
      order_items(id, quantity, product_snapshot)
    `)
        .order("created_at", { ascending: false });

    const orders = (ordersRaw ?? []) as unknown as (Order & {
        profile: { full_name: string; email: string };
    })[];

    // Agrupar por estado
    const columns = STATUS_COLUMNS.reduce(
        (acc, status) => {
            acc[status] = orders.filter((o) => o.status === status);
            return acc;
        },
        {} as Record<OrderStatus, typeof orders>
    );

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-display font-bold text-[var(--color-primary)]">
                    Pedidos
                </h1>
                <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
                    Arrastra las tarjetas para cambiar el estado del pedido
                </p>
            </div>
            <KanbanBoard initialColumns={columns} />
        </div>
    );
}