import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTelegramReply } from "@/lib/telegram/bot";

interface TelegramUpdate {
    message?: {
        chat: { id: number };
        from?: { first_name?: string };
        text?: string;
    };
}

export async function POST(request: NextRequest) {
    try {
        // Verificar el secreto del webhook
        const secret = request.headers.get("x-telegram-bot-api-secret-token");
        if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const update = await request.json() as TelegramUpdate;
        const message = update.message;

        if (!message?.text) {
            return NextResponse.json({ ok: true });
        }

        const chatId = message.chat.id;
        const text = message.text.trim();

        // ── Comando /start ────────────────────────────────────────
        if (text === "/start") {
            await sendTelegramReply(
                chatId,
                `¡Hola! 👋 Soy el bot de *MADEVIC*.\n\nPara vincular tu cuenta y recibir notificaciones de tus pedidos, ve a tu perfil en la tienda y genera un código de vinculación.\n\nLuego envíame: \`/vincular CODIGO\``
            );
            return NextResponse.json({ ok: true });
        }

        // ── Comando /vincular CODIGO ──────────────────────────────
        if (text.startsWith("/vincular ")) {
            const code = text.replace("/vincular ", "").trim();

            if (!code || code.length !== 6) {
                await sendTelegramReply(
                    chatId,
                    "❌ Código inválido. Genera un nuevo código desde tu perfil en la tienda."
                );
                return NextResponse.json({ ok: true });
            }

            const adminClient = createAdminClient();

            // Buscar el usuario con ese código
            const { data: profileRaw } = await adminClient
                .from("profiles")
                .select("id, full_name, telegram_chat_id")
                .eq("telegram_code", code)
                .single();

            const profile = profileRaw as unknown as {
                id: string;
                full_name: string | null;
                telegram_chat_id: string | null;
            } | null;

            if (!profile) {
                await sendTelegramReply(
                    chatId,
                    "❌ Código incorrecto o expirado. Genera un nuevo código desde tu perfil."
                );
                return NextResponse.json({ ok: true });
            }

            if (profile.telegram_chat_id) {
                await sendTelegramReply(
                    chatId,
                    "✅ Tu cuenta ya está vinculada a Telegram."
                );
                return NextResponse.json({ ok: true });
            }

            // Vincular — guardar chat_id y limpiar el código
            const { error } = await adminClient
                .from("profiles")
                .update({
                    telegram_chat_id: chatId.toString(),
                    telegram_code: null,
                } as never)
                .eq("id", profile.id);

            if (error) {
                await sendTelegramReply(
                    chatId,
                    "❌ Error al vincular. Intenta de nuevo más tarde."
                );
                return NextResponse.json({ ok: true });
            }

            await sendTelegramReply(
                chatId,
                `✅ ¡Cuenta vinculada exitosamente!\n\nHola *${profile.full_name ?? ""}*, a partir de ahora recibirás notificaciones de tus pedidos MADEVIC aquí en Telegram. 🪵`
            );

            return NextResponse.json({ ok: true });
        }

        // ── Comando desconocido ───────────────────────────────────
        await sendTelegramReply(
            chatId,
            "No entiendo ese comando. Usa /vincular CODIGO para vincular tu cuenta."
        );

        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error("Telegram webhook error:", error);
        return NextResponse.json({ ok: true }); // Siempre 200 a Telegram
    }
}