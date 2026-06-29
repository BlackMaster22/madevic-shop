import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrderDetailClient from "@/components/store/OrderDetailClient";
import type { Order, OrderStatusLog } from "@/types/database";

interface Props {
    params: Promise<{ id: string }>;
}

export const metadata = { title: "Detalle del pedido" };

export default async function OrderDetailPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: orderRaw } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (!orderRaw) notFound();

    const { data: logRaw } = await supabase
        .from("order_status_log")
        .select("*")
        .eq("order_id", id)
        .order("created_at", { ascending: true });

    const order = orderRaw as unknown as Order;
    const statusLog = (logRaw ?? []) as unknown as OrderStatusLog[];

    return (
        <div className="section">
            <div className="container-madevic max-w-3xl">
                <OrderDetailClient order={order} statusLog={statusLog} />
            </div>
        </div>
    );
}