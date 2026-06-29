"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/types/database";
import ProductCard from "@/components/store/ProductCard";
import { useWishlist } from "@/hooks/useWishlist";

interface Props {
    initialProducts: Product[];
}

export default function WishlistClient({ initialProducts }: Props) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const { toggle } = useWishlist();

    const handleRemove = async (productId: string) => {
        await toggle(productId);
        setProducts((prev) => prev.filter((p) => p.id !== productId));
    };

    if (products.length === 0) {
        return (
            <div className="card p-16 text-center">
                <div className="w-20 h-20 rounded-full bg-[var(--color-surface-container)] flex items-center justify-center mx-auto mb-4">
                    <Heart size={36} className="text-[var(--color-outline)]" />
                </div>
                <h2 className="font-display font-bold text-xl text-[var(--color-primary)] mb-2">
                    No tienes favoritos aún
                </h2>
                <p className="text-sm text-[var(--color-on-surface-variant)] mb-6">
                    Explora el catálogo y guarda los productos que más te gusten
                </p>
                <Link href="/catalogo" className="btn btn-primary btn-md">
                    Explorar catálogo
                </Link>
            </div>
        );
    }

    return (
        <div>
            <p className="text-sm text-[var(--color-on-surface-variant)] mb-6">
                {products.length}{" "}
                {products.length === 1 ? "producto guardado" : "productos guardados"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map((product) => (
                    <div key={product.id} className="relative">
                        <ProductCard product={product} />
                        {/* Botón quitar de favoritos superpuesto */}
                        <button
                            onClick={() => handleRemove(product.id)}
                            className="absolute top-3 right-3 z-10 text-xs px-2 py-1 rounded-full bg-white/90 text-[var(--color-error)] hover:bg-[var(--color-error-container)] transition-colors border border-[var(--color-outline-variant)]"
                        >
                            Quitar
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}