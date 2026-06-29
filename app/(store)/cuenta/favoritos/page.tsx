import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WishlistClient from "@/components/store/WishlistClient";
import type { Product } from "@/types/database";

export const metadata = { title: "Mis favoritos" };

interface WishlistRow {
    product: Product | null;
}

export default async function FavoritosPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login?redirect=/cuenta/favoritos");

    const { data: wishlistRaw } = await supabase
        .from("wishlist")
        .select("*, product:products(*, category:categories(*))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    // Castear primero, operar después — regla fija con tipos manuales
    const wishlist = (wishlistRaw ?? []) as unknown as WishlistRow[];

    const products = wishlist
        .map((w) => w.product)
        .filter((p): p is Product => p !== null);

    return (
        <div className="section">
            <div className="container-madevic">
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold text-[var(--color-primary)]">
                        Mis favoritos
                    </h1>
                    <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
                        Productos que guardaste para más tarde
                    </p>
                </div>
                <WishlistClient initialProducts={products} />
            </div>
        </div>
    );
}