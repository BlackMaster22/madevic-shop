import { Resend } from "resend";
import type { OrderStatus } from "@/types/database";

const resend = new Resend(process.env.RESEND_API_KEY!);

const FROM = `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

// ── Colores por estado ────────────────────────────────────────
const STATUS_CONFIG: Partial<Record<OrderStatus, {
    label: string;
    color: string;
    message: string;
    emoji: string;
}>> = {
    recibido: {
        label: "Pedido recibido",
        color: "#1565c0",
        message: "Hemos recibido tu pedido y ya está siendo procesado por nuestro equipo.",
        emoji: "📦",
    },
    listo: {
        label: "¡Tu pedido está listo!",
        color: "#2e7d32",
        message: "Tu pedido ha sido completado y está listo para ser entregado. Nos pondremos en contacto contigo para coordinar la entrega.",
        emoji: "✅",
    },
    entregado: {
        label: "Pedido entregado",
        color: "#6a1b9a",
        message: "Tu pedido ha sido entregado exitosamente. ¡Esperamos que disfrutes tu nuevo mueble MADEVIC!",
        emoji: "🏠",
    },
    cancelado: {
        label: "Pedido cancelado",
        color: "#c62828",
        message: "Lamentamos informarte que tu pedido ha sido cancelado. Si tienes alguna pregunta, no dudes en contactarnos.",
        emoji: "❌",
    },
};

interface SendOrderEmailParams {
    to: string;
    clientName: string;
    orderNumber: string;
    orderId: string;
    status: OrderStatus;
    adminNote?: string | null;
}

// ── Template HTML del email ───────────────────────────────────
function buildEmailHtml(params: SendOrderEmailParams): string {
    const config = STATUS_CONFIG[params.status];
    if (!config) return "";

    const trackUrl = `${APP_URL}/cuenta/pedidos/${params.orderId}`;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${config.label}</title>
</head>
<body style="margin:0;padding:0;background:#fbf9f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fbf9f4;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#44241c;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
                MADEVIC
              </h1>
              <p style="margin:4px 0 0;color:#eebbae;font-size:13px;">
                Esencia de la Madera
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px;border-left:1px solid #d5c3be;border-right:1px solid #d5c3be;">

              <!-- Emoji + título -->
              <div style="text-align:center;margin-bottom:32px;">
                <div style="font-size:48px;margin-bottom:16px;">${config.emoji}</div>
                <h2 style="margin:0;color:${config.color};font-size:22px;font-weight:700;">
                  ${config.label}
                </h2>
              </div>

              <!-- Saludo -->
              <p style="color:#1b1c19;font-size:15px;line-height:1.6;margin:0 0 16px;">
                Hola <strong>${params.clientName}</strong>,
              </p>
              <p style="color:#514441;font-size:15px;line-height:1.6;margin:0 0 24px;">
                ${config.message}
              </p>

              <!-- Número de pedido -->
              <div style="background:#f5f3ee;border:1px solid #d5c3be;border-radius:10px;padding:20px;margin-bottom:24px;text-align:center;">
                <p style="margin:0 0 6px;font-size:12px;color:#514441;text-transform:uppercase;letter-spacing:0.08em;">
                  Número de pedido
                </p>
                <p style="margin:0;font-size:24px;font-weight:700;color:#44241c;font-family:monospace;">
                  ${params.orderNumber}
                </p>
              </div>

              <!-- Nota del admin -->
              ${params.adminNote ? `
              <div style="background:#fff8e1;border:1px solid #ffe082;border-radius:10px;padding:16px;margin-bottom:24px;">
                <p style="margin:0 0 6px;font-size:12px;color:#f57f17;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">
                  Mensaje de MADEVIC
                </p>
                <p style="margin:0;font-size:14px;color:#1b1c19;line-height:1.6;">
                  ${params.adminNote}
                </p>
              </div>
              ` : ""}

              <!-- CTA -->
              <div style="text-align:center;margin-top:32px;">
                
                  href="${trackUrl}"
                  style="display:inline-block;background:#44241c;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;"
                >
                  Ver estado del pedido
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f0eee9;border:1px solid #d5c3be;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#514441;line-height:1.6;">
                © ${new Date().getFullYear()} MADEVIC — Industria Cubana del Mueble DUJO<br/>
                La Habana, Cuba · <a href="mailto:contacto@madevic.cu" style="color:#7c5730;">contacto@madevic.cu</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ── Función principal de envío ────────────────────────────────
export async function sendOrderStatusEmail(
    params: SendOrderEmailParams
): Promise<boolean> {
    const config = STATUS_CONFIG[params.status];
    if (!config) return false; // Estado sin email configurado

    try {
        const { error } = await resend.emails.send({
            from: FROM,
            to: params.to,
            subject: `${config.emoji} ${config.label} — ${params.orderNumber}`,
            html: buildEmailHtml(params),
        });

        if (error) {
            console.error("Resend error:", error);
            return false;
        }

        return true;
    } catch (err) {
        console.error("Email send error:", err);
        return false;
    }
}