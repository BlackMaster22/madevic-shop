import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderStatusEmail } from "@/lib/email/resend";
import { sendOrderStatusTelegram } from "@/lib/telegram/bot";
import type { OrderStatus, Order, Profile } from "@/types/database";

interface NotifyPayload {
    orderId: string;
    status: OrderStatus;
}

// Estados que disparan notificaciones
const NOTIFY_STATUSES: OrderStatus[] = [
    "recibido", "listo", "entregado", "cancelado",
];

export async function POST(request: NextRequest) {
    try {
        const { orderId, status } = await request.json() as NotifyPayload;

        if (!orderId || !status) {
            return NextResponse.json(
                { error: "orderId y status son requeridos" },
                { status: 400 }
            );
        }

        // Solo notificar en estados clave
        if (!NOTIFY_STATUSES.includes(status)) {
            return NextResponse.json({ ok: true, skipped: true });
        }

        const adminClient = createAdminClient();

        // Obtener datos del pedido
        const { data: orderRaw } = await adminClient
            .from("orders")
            .select("*, profile:profiles(*)")
            .eq("id", orderId)
            .single();

        if (!orderRaw) {
            return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
        }

        const order = orderRaw as unknown as Order & { profile: Profile };

        // Obtener nota del admin (del último log)
        const { data: logRaw } = await adminClient
            .from("order_status_log")
            .select("note")
            .eq("order_id", orderId)
            .eq("new_status", status)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        const adminNote = (logRaw as unknown as { note: string | null } | null)
            ?.note ?? null;

        let emailSent = false;
        let telegramSent = false;

        // ── Enviar email ──────────────────────────────────────────
        if (order.profile?.email) {
            emailSent = await sendOrderStatusEmail({
                to: order.profile.email,
                clientName: order.profile.full_name ?? "Cliente",
                orderNumber: order.order_number,
                orderId: order.id,
                status,
                adminNote,
            });
        }

        // ── Enviar Telegram (solo si tiene chat_id vinculado) ─────
        if (order.profile?.telegram_chat_id) {
            telegramSent = await sendOrderStatusTelegram({
                chatId: order.profile.telegram_chat_id,
                orderNumber: order.order_number,
                orderId: order.id,
                status,
                adminNote,
            });
        }

        // ── Actualizar log con estado de notificaciones ───────────
        await adminClient
            .from("order_status_log")
            .update({
                notified_email: emailSent,
                notified_telegram: telegramSent,
            } as never)
            .eq("order_id", orderId)
            .eq("new_status", status)
            .order("created_at", { ascending: false })
            .limit(1);

        return NextResponse.json({
            ok: true,
            emailSent,
            telegramSent,
        });

    } catch (error) {
        console.error("Notify error:", error);
        return NextResponse.json(
            { error: "Error interno" },
            { status: 500 }
        );
    }
}