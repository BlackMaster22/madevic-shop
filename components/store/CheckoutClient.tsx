"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
    ShoppingBag,
    MapPin,
    MessageSquare,
    Package,
    ArrowLeft,
    CheckCircle,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import toast from "react-hot-toast";
import type { Profile } from "@/types/database";

interface Props {
    profile: Profile;
}

interface ShippingForm {
    street: string;
    city: string;
    province: string;
}

export default function CheckoutClient({ profile }: Props) {
    const router = useRouter();
    const supabase = createClient();

    const { items, totalAmount, clearCart } = useCartStore();

    const [shipping, setShipping] = useState<ShippingForm>({
        street: profile.address ?? "",
        city: "",
        province: "",
    });
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    const total = totalAmount();

    const updateShipping = (field: keyof ShippingForm) =>
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setShipping((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (items.length === 0) {
            toast.error("Tu carrito está vacío");
            return;
        }

        if (!shipping.street.trim()) {
            toast.error("La dirección de entrega es obligatoria");
            return;
        }

        setLoading(true);

        try {
            // ── 1. Crear el pedido ──────────────────────────────
            const { data: orderData, error: orderError } = await supabase
                .from("orders")
                .insert({
                    user_id: profile.id,
                    order_number: "TEMP",   // el trigger lo reemplaza
                    status: "recibido",
                    total_amount: total,
                    shipping_address: shipping,
                    client_notes: notes || null,
                } as never)
                .select()
                .single();

            if (orderError || !orderData) {
                throw new Error("Error al crear el pedido");
            }

            const order = orderData as { id: string; order_number: string };

            // ── 2. Crear los items del pedido ───────────────────
            const orderItems = items.map((item) => ({
                order_id: order.id,
                product_id: item.product.id,
                quantity: item.quantity,
                unit_price: item.product.price,
                product_snapshot: {
                    name: item.product.name,
                    price: item.product.price,
                    images: item.product.images,
                    category: item.product.category?.name,
                },
            }));

            const { error: itemsError } = await supabase
                .from("order_items")
                .insert(orderItems as never);

            if (itemsError) throw new Error("Error al guardar los productos");

            // ── 3. Notificar (email + Telegram) ────────────────
            await fetch("/api/notify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: order.id,
                    status: "recibido",
                }),
            });

            // ── 4. Limpiar carrito y mostrar éxito ──────────────
            clearCart();
            setSuccess(order.order_number);

        } catch (err) {
            console.error(err);
            toast.error("Error al procesar el pedido. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    // ── Pantalla de éxito ─────────────────────────────────────
    if (success) {
        return (
            <div className="card p-12 text-center max-w-lg mx-auto">
                <div className="w-20 h-20 rounded-full bg-[var(--color-status-listo)] flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-[var(--color-status-listo-text)]" />
                </div>
                <h2 className="text-2xl font-display font-bold text-[var(--color-primary)] mb-2">
                    ¡Pedido confirmado!
                </h2>
                <p className="text-sm text-[var(--color-on-surface-variant)] mb-2">
                    Tu número de pedido es:
                </p>
                <p className="text-2xl font-mono font-bold text-[var(--color-secondary)] mb-6">
                    {success}
                </p>
                <p className="text-sm text-[var(--color-on-surface-variant)] mb-8">
                    Recibirás un email de confirmación y podrás rastrear tu pedido
                    desde tu cuenta.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/cuenta/pedidos" className="btn btn-primary btn-md">
                        Ver mis pedidos
                    </Link>
                    <Link href="/catalogo" className="btn btn-outline btn-md">
                        Seguir comprando
                    </Link>
                </div>
            </div>
        );
    }

    // ── Carrito vacío ─────────────────────────────────────────
    if (items.length === 0) {
        return (
            <div className="card p-12 text-center">
                <ShoppingBag size={40} className="text-[var(--color-outline)] mx-auto mb-4" />
                <h2 className="font-display font-bold text-xl text-[var(--color-primary)] mb-2">
                    Tu carrito está vacío
                </h2>
                <Link href="/catalogo" className="btn btn-primary btn-md mt-4">
                    Ver catálogo
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                {/* ── Columna izquierda — formulario ───────────────── */}
                <div className="lg:col-span-3 space-y-6">

                    {/* Dirección */}
                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <MapPin size={20} className="text-[var(--color-secondary)]" />
                            <h2 className="font-semibold text-[var(--color-on-surface)]">
                                Dirección de entrega
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <Input
                                label="Calle y número *"
                                value={shipping.street}
                                onChange={updateShipping("street")}
                                placeholder="Ej: Calle 23 #456 e/ G y H"
                                required
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    label="Ciudad / Municipio"
                                    value={shipping.city}
                                    onChange={updateShipping("city")}
                                    placeholder="La Habana"
                                />
                                <Input
                                    label="Provincia"
                                    value={shipping.province}
                                    onChange={updateShipping("province")}
                                    placeholder="La Habana"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notas */}
                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <MessageSquare size={20} className="text-[var(--color-secondary)]" />
                            <h2 className="font-semibold text-[var(--color-on-surface)]">
                                Notas especiales
                            </h2>
                        </div>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ej: medidas personalizadas, color preferido, instrucciones de entrega..."
                            rows={4}
                            hint="Opcional — comparte cualquier detalle especial sobre tu pedido"
                        />
                    </div>
                </div>

                {/* ── Columna derecha — resumen ─────────────────────── */}
                <div className="lg:col-span-2">
                    <div className="card p-6 sticky top-24">
                        <div className="flex items-center gap-3 mb-5">
                            <ShoppingBag size={20} className="text-[var(--color-secondary)]" />
                            <h2 className="font-semibold text-[var(--color-on-surface)]">
                                Resumen del pedido
                            </h2>
                        </div>

                        {/* Items */}
                        <div className="space-y-3 mb-5">
                            {items.map((item) => (
                                <div key={item.product.id} className="flex gap-3">
                                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-[var(--color-surface-container)] flex-shrink-0">
                                        {item.product.images?.[0] ? (
                                            <Image
                                                src={item.product.images[0]}
                                                alt={item.product.name}
                                                width={56}
                                                height={56}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package size={18} className="text-[var(--color-outline)]" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[var(--color-on-surface)] line-clamp-1">
                                            {item.product.name}
                                        </p>
                                        <p className="text-xs text-[var(--color-on-surface-variant)]">
                                            Cant: {item.quantity}
                                        </p>
                                        {item.product.price !== null ? (
                                            <p className="text-sm font-semibold text-[var(--color-secondary)]">
                                                ${(item.product.price * item.quantity).toFixed(2)}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-[var(--color-on-surface-variant)] italic">
                                                Precio a consultar
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="border-t border-[var(--color-outline-variant)] pt-4 mb-5">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-[var(--color-on-surface)]">
                                    Total estimado
                                </span>
                                {total !== null ? (
                                    <span className="text-xl font-bold font-display text-[var(--color-primary)]">
                                        ${total.toFixed(2)}
                                    </span>
                                ) : (
                                    <span className="text-sm text-[var(--color-on-surface-variant)] italic">
                                        A consultar
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="space-y-3">
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                fullWidth
                                loading={loading}
                            >
                                Confirmar pedido
                            </Button>
                            <Link
                                href="/catalogo"
                                className="btn btn-ghost btn-md w-full gap-2"
                            >
                                <ArrowLeft size={16} />
                                Seguir comprando
                            </Link>
                        </div>

                        <p className="text-xs text-[var(--color-on-surface-variant)] text-center mt-4">
                            Al confirmar aceptas que el pago se gestiona directamente
                            con MADEVIC tras recibir tu pedido.
                        </p>
                    </div>
                </div>
            </div>
        </form>
    );
}