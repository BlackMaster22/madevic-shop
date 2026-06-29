"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { clsx } from "clsx";
import type { FeaturedGallery } from "@/types/database";

interface FeaturedCarouselProps {
    items: FeaturedGallery[];
}

export default function FeaturedCarousel({ items }: FeaturedCarouselProps) {
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const prev = useCallback(() => {
        setCurrent((c) => (c === 0 ? items.length - 1 : c - 1));
    }, [items.length]);

    const next = useCallback(() => {
        setCurrent((c) => (c === items.length - 1 ? 0 : c + 1));
    }, [items.length]);

    // Auto-avance cada 5 segundos
    useEffect(() => {
        if (isPaused || items.length <= 1) return;
        const interval = setInterval(next, 5000);
        return () => clearInterval(interval);
    }, [isPaused, next, items.length]);

    if (items.length === 0) return null;

    return (
        <div
            className="relative rounded-2xl overflow-hidden bg-[var(--color-surface-container)] select-none"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Slides */}
            <div className="relative aspect-[16/7] md:aspect-[16/6]">
                {items.map((item, i) => (
                    <div
                        key={item.id}
                        className={clsx(
                            "absolute inset-0 transition-opacity duration-700",
                            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
                        )}
                    >
                        {item.image_url ? (
                            <Image
                                src={item.image_url}
                                alt={item.title ?? `Producto destacado ${i + 1}`}
                                fill
                                className="object-cover"
                                priority={i === 0}
                                sizes="(max-width: 768px) 100vw, 1200px"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[var(--color-surface-container-high)]">
                                <Package size={48} className="text-[var(--color-outline)]" />
                            </div>
                        )}

                        {/* Overlay con texto */}
                        {(item.title || item.subtitle) && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6 md:p-10">
                                <div className="text-white">
                                    {item.title && (
                                        <h3 className="font-display text-xl md:text-3xl font-bold drop-shadow-sm">
                                            {item.title}
                                        </h3>
                                    )}
                                    {item.subtitle && (
                                        <p className="text-sm md:text-base text-white/80 mt-1">
                                            {item.subtitle}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Controles — solo si hay más de 1 imagen */}
            {items.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
                        aria-label="Anterior"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
                        aria-label="Siguiente"
                    >
                        <ChevronRight size={20} />
                    </button>

                    {/* Indicadores */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                        {items.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={clsx(
                                    "rounded-full transition-all duration-300",
                                    i === current
                                        ? "w-6 h-2 bg-white"
                                        : "w-2 h-2 bg-white/50 hover:bg-white/80"
                                )}
                                aria-label={`Ir a imagen ${i + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}