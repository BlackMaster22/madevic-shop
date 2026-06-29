const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

import type { OrderStatus } from "@/types/database";

// ── Mensajes por estado ───────────────────────────────────────
const STATUS_MESSAGES: Partial<Record<OrderStatus, string>> = {
    recibido: "📦 *Pedido recibido*\nHemos recibido tu pedido y ya está siendo procesado.",
    listo: "✅ *¡Tu pedido está listo!*\nTu pedido ha sido completado y está listo para entrega.",
    entregado: "🏠 *Pedido entregado*\n¡Tu pedido ha sido entregado! Esperamos que disfrutes tu mueble MADEVIC.",
    cancelado: "❌ *Pedido cancelado*\nLamentamos informarte que tu pedido ha sido cancelado.",
};

interface SendNotificationParams {
    chatId: string;
    orderNumber: string;
    orderId: string;
    status: OrderStatus;
    adminNote?: string | null;
}

// ── Enviar mensaje ────────────────────────────────────────────
export async function sendTelegramMessage(
    chatId: string,
    message: string
): Promise<boolean> {
    try {
        const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [],
                },
            }),
        });

        const data = await res.json() as { ok: boolean };
        return data.ok;
    } catch (err) {
        console.error("Telegram send error:", err);
        return false;
    }
}

// ── Notificación de cambio de estado ─────────────────────────
export async function sendOrderStatusTelegram(
    params: SendNotificationParams
): Promise<boolean> {
    const template = STATUS_MESSAGES[params.status];
    if (!template) return false;

    const trackUrl = `${APP_URL}/cuenta/pedidos/${params.orderId}`;

    let message = `${template}\n\n`;
    message += `🔖 *Pedido:* \`${params.orderNumber}\`\n`;

    if (params.adminNote) {
        message += `\n💬 *Mensaje de MADEVIC:*\n${params.adminNote}\n`;
    }

    message += `\n[Ver estado del pedido](${trackUrl})`;

    return sendTelegramMessage(params.chatId, message);
}

// ── Responder al webhook de vinculación ───────────────────────
export async function sendTelegramReply(
    chatId: string | number,
    message: string
): Promise<void> {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "Markdown",
        }),
    });
}