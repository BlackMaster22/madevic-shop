"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order, OrderStatusLog } from "@/types/database";

export function useOrderRealtime(orderId: string) {
    const [order, setOrder] = useState<Order | null>(null);
    const [statusLog, setStatusLog] = useState<OrderStatusLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (!orderId) return;

        // Carga inicial
        const loadOrder = async () => {
            setIsLoading(true);
            const { data } = await supabase
                .from("orders")
                .select(`
          *,
          order_items (*)
        `)
                .eq("id", orderId)
                .single();

            if (data) setOrder(data as Order);

            const { data: log } = await supabase
                .from("order_status_log")
                .select("*")
                .eq("order_id", orderId)
                .order("created_at", { ascending: true });

            if (log) setStatusLog(log as OrderStatusLog[]);
            setIsLoading(false);
        };

        loadOrder();

        // Suscripción Realtime — actualiza el estado sin recargar
        const channel = supabase
            .channel(`order-${orderId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "orders",
                    filter: `id=eq.${orderId}`,
                },
                (payload) => {
                    setOrder((prev) =>
                        prev ? { ...prev, ...payload.new } : (payload.new as Order)
                    );
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "order_status_log",
                    filter: `order_id=eq.${orderId}`,
                },
                (payload) => {
                    setStatusLog((prev) => [...prev, payload.new as OrderStatusLog]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [orderId]);

    return { order, statusLog, isLoading };
}