"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Package, Minus, Plus, ShoppingCart, Heart, Ruler } from "lucide-react";
import { clsx } from "clsx";
import type { Product } from "@/types/database";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/store/ProductCard";

interface Props {
    product: Product;
    related: Product[];
}

export default function ProductDetailClient({ product, related }: Props) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    const { addToCart } = useCart();
    const { isInWishlist, toggle } = useWishlist();
    const inWishlist = isInWishlist(product.id);

    const hasImages = product.images?.length > 0;

    const handleAdd = async () => {
        setAdding(true);
        await addToCart(product, quantity);
        setTimeout(() => setAdding(false), 600);
    };

    return (
        <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-[var(--color-on-surface-variant)] mb-8">
                <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">
                    Inicio
                </Link>
                <span>/</span>
                <Link href="/catalogo" className="hover:text-[var(--color-primary)] transition-colors">
                    Catálogo
                </Link>
                {product.category && (
                    <>
                        <span>/</span>
                        <Link
                            href={`/catalogo?categoria=${product.category.slug}`}
                            className="hover:text-[var(--color-primary)] transition-colors"
                        >
                            {product.category.name}
                        </Link>
                    </>
                )}
                <span>/</span>
                <span className="text-[var(--color-on-surface)] font-medium truncate">
                    {product.name}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

                {/* ── Galería de imágenes ─────────────────────────── */}
                <div className="space-y-3">
                    {/* Imagen principal */}
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--color-surface-container)]">
                        {hasImages ? (
                            <Image
                                src={product.images[selectedImage]}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                <Package size={64} className="text-[var(--color-outline-variant)]" />
                                <span className="text-sm text-[var(--color-on-surface-variant)]">
                                    Sin imagen disponible
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Miniaturas */}
                    {product.images?.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                            {product.images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImage(i)}
                                    className={clsx(
                                        "relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors",
                                        selectedImage === i
                                            ? "border-[var(--color-secondary)]"
                                            : "border-transparent hover:border-[var(--color-outline-variant)]"
                                    )}
                                >
                                    <Image
                                        src={img}
                                        alt={`${product.name} ${i + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="80px"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Info del producto ───────────────────────────── */}
                <div className="flex flex-col gap-6">

                    {/* Categoría y nombre */}
                    <div>
                        {product.category && (
                            <Link
                                href={`/catalogo?categoria=${product.category.slug}`}
                                className="text-sm font-medium text-[var(--color-secondary)] uppercase tracking-widest hover:underline"
                            >
                                {product.category.name}
                            </Link>
                        )}
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--color-primary)] mt-2 leading-tight">
                            {product.name}
                        </h1>
                    </div>

                    {/* Precio */}
                    <div>
                        {product.price !== null ? (
                            <p className="text-3xl font-bold font-display text-[var(--color-secondary)]">
                                ${product.price.toFixed(2)}
                            </p>
                        ) : (
                            <p className="text-lg text-[var(--color-on-surface-variant)] italic">
                                Precio a consultar — contáctanos para más información
                            </p>
                        )}
                    </div>

                    {/* Descripción */}
                    {product.description && (
                        <p className="text-[var(--color-on-surface-variant)] leading-relaxed">
                            {product.description}
                        </p>
                    )}

                    {/* Dimensiones */}
                    {product.dimensions && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]">
                            <Ruler size={18} className="text-[var(--color-secondary)] mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-[var(--color-on-surface)] mb-2">
                                    Dimensiones
                                </p>
                                <div className="flex flex-wrap gap-4 text-sm text-[var(--color-on-surface-variant)]">
                                    {product.dimensions.width && (
                                        <span>Ancho: <strong>{product.dimensions.width} mm</strong></span>
                                    )}
                                    {product.dimensions.depth && (
                                        <span>Profundo: <strong>{product.dimensions.depth} mm</strong></span>
                                    )}
                                    {product.dimensions.height && (
                                        <span>Alto: <strong>{product.dimensions.height} mm</strong></span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Selector cantidad + Añadir al carrito */}
                    <div className="flex gap-3 items-center">
                        <div className="flex items-center gap-1 bg-[var(--color-surface-container)] rounded-lg p-1">
                            <button
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                disabled={quantity <= 1}
                                className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-[var(--color-surface-container-high)] disabled:opacity-40 transition-colors"
                            >
                                <Minus size={16} />
                            </button>
                            <span className="w-10 text-center font-semibold text-[var(--color-on-surface)]">
                                {quantity}
                            </span>
                            <button
                                onClick={() => setQuantity((q) => q + 1)}
                                className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-[var(--color-surface-container-high)] transition-colors"
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            loading={adding}
                            onClick={handleAdd}
                        >
                            <ShoppingCart size={18} />
                            {adding ? "Añadiendo..." : "Añadir al carrito"}
                        </Button>

                        <button
                            onClick={() => toggle(product.id)}
                            className={clsx(
                                "w-11 h-11 flex-shrink-0 rounded-lg border flex items-center justify-center transition-all",
                                inWishlist
                                    ? "border-[var(--color-error)] text-[var(--color-error)] bg-[var(--color-error-container)]"
                                    : "border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:border-[var(--color-error)] hover:text-[var(--color-error)]"
                            )}
                            aria-label={inWishlist ? "Quitar de favoritos" : "Añadir a favoritos"}
                        >
                            <Heart size={20} className={clsx(inWishlist && "fill-current")} />
                        </button>
                    </div>

                    {/* Nota sobre pedidos */}
                    <p className="text-xs text-[var(--color-on-surface-variant)] border-t border-[var(--color-outline-variant)] pt-4">
                        🪵 Todos nuestros productos se fabrican bajo pedido con madera
                        seleccionada. El tiempo de entrega puede variar según disponibilidad.
                    </p>
                </div>
            </div>

            {/* ── Productos relacionados ───────────────────────────── */}
            {related.length > 0 && (
                <div className="mt-16">
                    <h2 className="text-2xl font-display font-bold text-[var(--color-primary)] mb-6">
                        También te puede interesar
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {related.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}