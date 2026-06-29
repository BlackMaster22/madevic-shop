"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { clsx } from "clsx";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    totalItems,
    totalAmount,
    clearCart,
  } = useCartStore();

  const { profile } = useAuthStore();

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, closeCart]);

  // Bloquear scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const total = totalAmount();
  const count = totalItems();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="overlay z-40" onClick={closeCart} />
      )}

      {/* Drawer */}
      <div
        className={clsx(
          "fixed top-0 right-0 h-full w-full sm:w-96 z-50",
          "bg-[var(--color-surface-bright)] shadow-[var(--shadow-drawer)]",
          "flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-outline-variant)]">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-[var(--color-primary)]" />
            <h2 className="font-display text-lg font-bold text-[var(--color-primary)]">
              Carrito
            </h2>
            {count > 0 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-primary-fixed)] text-[var(--color-primary)]">
                {count} {count === 1 ? "producto" : "productos"}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="btn btn-ghost btn-sm p-2 rounded-lg"
            aria-label="Cerrar carrito"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 px-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-[var(--color-surface-container)] flex items-center justify-center">
                <ShoppingBag size={32} className="text-[var(--color-outline)]" />
              </div>
              <div>
                <p className="font-medium text-[var(--color-on-surface)]">
                  Tu carrito está vacío
                </p>
                <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
                  Explora el catálogo y añade productos
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={closeCart}
              >
                Ver catálogo
              </Button>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 p-3 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]"
                >
                  {/* Imagen */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-[var(--color-surface-container)] flex-shrink-0">
                    {item.product.images?.[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag
                          size={24}
                          className="text-[var(--color-outline)]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-on-surface)] line-clamp-2 leading-tight">
                      {item.product.name}
                    </p>
                    {item.product.price !== null ? (
                      <p className="text-sm text-[var(--color-secondary)] font-semibold mt-1">
                        ${item.product.price.toFixed(2)}
                      </p>
                    ) : (
                      <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
                        Precio a consultar
                      </p>
                    )}

                    {/* Controles cantidad */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 bg-[var(--color-surface-container)] rounded-lg p-0.5">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--color-surface-container-high)] transition-colors"
                          aria-label="Reducir cantidad"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--color-surface-container-high)] transition-colors"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-1.5 rounded-lg text-[var(--color-error)] hover:bg-[var(--color-error-container)] transition-colors"
                        aria-label="Eliminar producto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Vaciar carrito */}
              <button
                onClick={clearCart}
                className="text-xs text-[var(--color-error)] hover:underline w-full text-center py-1"
              >
                Vaciar carrito
              </button>
            </>
          )}
        </div>

        {/* Footer con total y checkout */}
        {items.length > 0 && (
          <div className="border-t border-[var(--color-outline-variant)] px-5 py-4 space-y-3">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-on-surface-variant)]">
                Total estimado
              </span>
              {total !== null ? (
                <span className="text-lg font-bold text-[var(--color-primary)] font-display">
                  ${total.toFixed(2)}
                </span>
              ) : (
                <span className="text-sm text-[var(--color-on-surface-variant)] italic">
                  Incluye productos sin precio
                </span>
              )}
            </div>

            {/* Botón checkout */}
            {profile ? (
              <Link href="/checkout" onClick={closeCart} className="block">
                <Button variant="primary" size="lg" fullWidth>
                  Confirmar pedido
                </Button>
              </Link>
            ) : (
              <Link
                href="/login?redirect=/checkout"
                onClick={closeCart}
                className="block"
              >
                <Button variant="primary" size="lg" fullWidth>
                  Iniciar sesión para pedir
                </Button>
              </Link>
            )}

            <p className="text-xs text-center text-[var(--color-on-surface-variant)]">
              Los precios son orientativos. El pago se gestiona directamente.
            </p>
          </div>
        )}
      </div>
    </>
  );
}