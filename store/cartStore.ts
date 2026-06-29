import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/database";

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartStore {
    items: CartItem[];
    isOpen: boolean;

    // Acciones
    addItem: (product: Product, quantity: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;

    // Computed
    totalItems: () => number;
    totalAmount: () => number | null;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (product, quantity) => {
                set((state) => {
                    const existing = state.items.find(
                        (i) => i.product.id === product.id
                    );
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.product.id === product.id
                                    ? { ...i, quantity: i.quantity + quantity }
                                    : i
                            ),
                        };
                    }
                    return { items: [...state.items, { product, quantity }] };
                });
            },

            removeItem: (productId) => {
                set((state) => ({
                    items: state.items.filter((i) => i.product.id !== productId),
                }));
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }
                set((state) => ({
                    items: state.items.map((i) =>
                        i.product.id === productId ? { ...i, quantity } : i
                    ),
                }));
            },

            clearCart: () => set({ items: [] }),

            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

            totalItems: () =>
                get().items.reduce((sum, i) => sum + i.quantity, 0),

            totalAmount: () => {
                const items = get().items;
                // Si algún producto no tiene precio, retorna null
                const hasNullPrice = items.some((i) => i.product.price === null);
                if (hasNullPrice) return null;
                return items.reduce(
                    (sum, i) => sum + (i.product.price! * i.quantity),
                    0
                );
            },
        }),
        {
            name: "madevic-cart",
            // Solo persistir los items, no el estado del drawer
            partialize: (state) => ({ items: state.items }),
        }
    )
);