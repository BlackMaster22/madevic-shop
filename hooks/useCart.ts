"use client";

import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { Product } from "@/types/database";

export function useCart() {
    const cart = useCartStore();
    const { profile } = useAuthStore();
    const supabase = createClient();

    const addToCart = async (product: Product, quantity: number) => {
        // Verificar autenticación
        if (!profile) {
            toast.error("Debes iniciar sesión para añadir productos al carrito");
            // Redirigir al login guardando la URL actual
            window.location.href = `/login?redirect=${window.location.pathname}`;
            return;
        }

        cart.addItem(product, quantity);
        cart.openCart();
        toast.success(`${product.name} añadido al carrito`);
    };

    const removeFromCart = (productId: string) => {
        cart.removeItem(productId);
    };

    const updateQty = (productId: string, quantity: number) => {
        cart.updateQuantity(productId, quantity);
    };

    return {
        items: cart.items,
        isOpen: cart.isOpen,
        totalItems: cart.totalItems(),
        totalAmount: cart.totalAmount(),
        openCart: cart.openCart,
        closeCart: cart.closeCart,
        toggleCart: cart.toggleCart,
        clearCart: cart.clearCart,
        addToCart,
        removeFromCart,
        updateQty,
    };
}