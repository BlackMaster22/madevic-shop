import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/Badge";
import type { Order } from "@/types/database";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const metadata = { title: "Mis pedidos" };

export default async function OrdersPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login?redirect=/cuenta/pedidos");

    const { data: ordersRaw } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    const orders = (ordersRaw ?? []) as unknown as Order[];

    return (
        <div className="section">
            <div className="container-madevic max-w-3xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold text-[var(--color-primary)]">
                        Mis pedidos
                    </h1>
                    <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
                        Historial y seguimiento de tus pedidos
                    </p>
                </div>

                {orders.length === 0 ? (
                    <div className="card p-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-[var(--color-surface-container)] flex items-center justify-center mx-auto mb-4">
                            <Package size={36} className="text-[var(--color-outline)]" />
                        </div>
                        <h2 className="font-display font-bold text-xl text-[var(--color-primary)] mb-2">
                            Aún no tienes pedidos
                        </h2>
                        <p className="text-sm text-[var(--color-on-surface-variant)] mb-6">
                            Explora el catálogo y haz tu primer pedido
                        </p>
                        <Link href="/catalogo" className="btn btn-primary btn-md">
                            Ver catálogo
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Link
                                key={order.id}
                                href={`/cuenta/pedidos/${order.id}`}
                                className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-[var(--color-secondary)] transition-colors"
                            >
                                {/* Info pedido */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-mono text-sm font-bold text-[var(--color-primary)]">
                                            {order.order_number}
                                        </span>
                                        <StatusBadge status={order.status} />
                                    </div>
                                    <p className="text-xs text-[var(--color-on-surface-variant)]">
                                        {format(new Date(order.created_at), "d 'de' MMMM 'de' yyyy", {
                                            locale: es,
                                        })}
                                    </p>
                                    <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
                                        {order.order_items?.length ?? 0}{" "}
                                        {order.order_items?.length === 1 ? "producto" : "productos"}
                                        {order.total_amount !== null && (
                                            <> · <strong className="text-[var(--color-on-surface)]">
                                                ${order.total_amount.toFixed(2)}
                                            </strong></>
                                        )}
                                    </p>
                                </div>

                                {/* Flecha */}
                                <ArrowRight
                                    size={18}
                                    className="text-[var(--color-outline)] shrink-0 hidden sm:block"
                                />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}