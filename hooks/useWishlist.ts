"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export function useWishlist() {
    const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const { profile } = useAuthStore();
    const supabase = createClient();

    useEffect(() => {
        if (!profile) {
            setWishlistIds(new Set());
            return;
        }

        const loadWishlist = async () => {
            const { data } = await supabase
                .from("wishlist")
                .select("product_id")
                .eq("user_id", profile.id);

            if (data) {
                setWishlistIds(
                    new Set(
                        (data as Array<{ product_id: string }>).map((w) => w.product_id)
                    )
                );
            }
        };

        loadWishlist();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile?.id]);

    const toggle = async (productId: string) => {
        if (!profile) {
            toast.error("Debes iniciar sesión para guardar favoritos");
            return;
        }

        setIsLoading(true);
        const isInWishlist = wishlistIds.has(productId);

        if (isInWishlist) {
            const { error } = await supabase
                .from("wishlist")
                .delete()
                .eq("user_id", profile.id)
                .eq("product_id", productId);

            if (!error) {
                setWishlistIds((prev) => {
                    const next = new Set(prev);
                    next.delete(productId);
                    return next;
                });
                toast.success("Eliminado de favoritos");
            }
        } else {
            const { error } = await supabase
                .from("wishlist")
                .insert({
                    user_id: profile.id,
                    product_id: productId,
                } as never);

            if (!error) {
                setWishlistIds((prev) => new Set(prev).add(productId));
                toast.success("Añadido a favoritos");
            }
        }

        setIsLoading(false);
    };

    return {
        wishlistIds,
        isInWishlist: (productId: string) => wishlistIds.has(productId),
        toggle,
        isLoading,
    };
}