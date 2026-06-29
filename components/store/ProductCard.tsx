"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Minus, Plus, ShoppingCart, Package } from "lucide-react";
import { clsx } from "clsx";
import type { Product } from "@/types/database";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [imageError, setImageError] = useState(false);

    const { addToCart } = useCart();
    const { isInWishlist, toggle: toggleWishlist } = useWishlist();
    const { profile } = useAuthStore();

    const inWishlist = isInWishlist(product.id);
    const hasImage = product.images?.length > 0 && !imageError;

    const handleAddToCart = async () => {
        setAdding(true);
        await addToCart(product, quantity);
        setTimeout(() => {
            setAdding(false);
            setQuantity(1);
        }, 600);
    };

    const handleQuantityChange = (delta: number) => {
        setQuantity((prev) => Math.max(1, prev + delta));
    };

    return (
        <article className="card overflow-hidden flex flex-col group">

            {/* ── Imagen ─────────────────────────────────────────── */}
            <div className="relative aspect-[4/3] bg-[var(--color-surface-container)] overflow-hidden">
                {hasImage ? (
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <Package
                            size={40}
                            className="text-[var(--color-outline-variant)]"
                        />
                        <span className="text-xs text-[var(--color-on-surface-variant)]">
                            Sin imagen
                        </span>
                    </div>
                )}

                {/* Badge múltiples imágenes */}
                {product.images?.length > 1 && (
                    <span className="absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded-full bg-black/40 text-white backdrop-blur-sm">
                        +{product.images.length - 1}
                    </span>
                )}

                {/* Badge destacado */}
                {product.featured && (
                    <span className="absolute top-2 left-2 text-xs px-2.5 py-1 rounded-full bg-[var(--color-secondary)] text-white font-medium">
                        Destacado
                    </span>
                )}

                {/* Botón wishlist */}
                <button
                    onClick={() => toggleWishlist(product.id)}
                    className={clsx(
                        "absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center",
                        "bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-200",
                        "hover:scale-110 active:scale-95",
                        inWishlist
                            ? "text-[var(--color-error)]"
                            : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)]"
                    )}
                    aria-label={inWishlist ? "Quitar de favoritos" : "Añadir a favoritos"}
                >
                    <Heart
                        size={16}
                        className={clsx(inWishlist && "fill-current")}
                    />
                </button>
            </div>

            {/* ── Info ───────────────────────────────────────────── */}
            <div className="flex flex-col flex-1 p-4 gap-3">

                {/* Categoría */}
                {product.category && (
                    <span className="text-xs text-[var(--color-on-surface-variant)] uppercase tracking-wider">
                        {product.category.name}
                    </span>
                )}

                {/* Nombre */}
                <Link href={`/catalogo/${product.slug}`}>
                    <h3 className="font-display text-base font-bold text-[var(--color-primary)] leading-snug line-clamp-2 hover:text-[var(--color-secondary)] transition-colors">
                        {product.name}
                    </h3>
                </Link>

                {/* Dimensiones */}
                {product.dimensions && (
                    <p className="text-xs text-[var(--color-on-surface-variant)]">
                        {[
                            product.dimensions.width && `A: ${product.dimensions.width}mm`,
                            product.dimensions.depth && `P: ${product.dimensions.depth}mm`,
                            product.dimensions.height && `H: ${product.dimensions.height}mm`,
                        ]
                            .filter(Boolean)
                            .join(" · ")}
                    </p>
                )}

                {/* Precio */}
                <div className="mt-auto">
                    {product.price !== null ? (
                        <p className="text-lg font-bold text-[var(--color-secondary)] font-display">
                            ${product.price.toFixed(2)}
                        </p>
                    ) : (
                        <p className="text-sm text-[var(--color-on-surface-variant)] italic">
                            Precio a consultar
                        </p>
                    )}
                </div>

                {/* ── Controles de cantidad + Añadir al carrito ───── */}
                <div className="flex items-center gap-2 mt-1">

                    {/* Selector cantidad */}
                    <div className="flex items-center gap-1 bg-[var(--color-surface-container)] rounded-lg p-0.5 shrink-0">
                        <button
                            onClick={() => handleQuantityChange(-1)}
                            disabled={quantity <= 1}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--color-surface-container-high)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            aria-label="Reducir cantidad"
                        >
                            <Minus size={13} />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold text-[var(--color-on-surface)]">
                            {quantity}
                        </span>
                        <button
                            onClick={() => handleQuantityChange(1)}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--color-surface-container-high)] transition-colors"
                            aria-label="Aumentar cantidad"
                        >
                            <Plus size={13} />
                        </button>
                    </div>

                    {/* Botón añadir */}
                    <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        loading={adding}
                        onClick={handleAddToCart}
                        className="gap-1.5"
                    >
                        <ShoppingCart size={15} />
                        {adding ? "Añadiendo..." : "Añadir"}
                    </Button>
                </div>
            </div>
        </article>
    );
}