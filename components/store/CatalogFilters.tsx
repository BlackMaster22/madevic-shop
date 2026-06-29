"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { clsx } from "clsx";

interface CatalogFiltersProps {
    initialQ: string;
    initialOrden: string;
    initialMin: string;
    initialMax: string;
}

const ORDEN_OPTIONS = [
    { value: "novedad", label: "Más recientes" },
    { value: "precio-asc", label: "Precio: menor a mayor" },
    { value: "precio-desc", label: "Precio: mayor a menor" },
];

export default function CatalogFilters({
    initialQ,
    initialOrden,
    initialMin,
    initialMax,
}: CatalogFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [q, setQ] = useState(initialQ);
    const [orden, setOrden] = useState(initialOrden);
    const [min, setMin] = useState(initialMin);
    const [max, setMax] = useState(initialMax);
    const [showPrice, setShowPrice] = useState(false);

    // Actualizar URL con los filtros
    const updateParams = useCallback(
        (updates: Record<string, string>) => {
            const params = new URLSearchParams(searchParams.toString());

            Object.entries(updates).forEach(([key, value]) => {
                if (value) {
                    params.set(key, value);
                } else {
                    params.delete(key);
                }
            });

            startTransition(() => {
                router.push(`${pathname}?${params.toString()}`);
            });
        },
        [pathname, router, searchParams]
    );

    // Debounce para la búsqueda
    const handleSearch = useCallback(
        (value: string) => {
            setQ(value);
            const timeout = setTimeout(() => {
                updateParams({ q: value });
            }, 400);
            return () => clearTimeout(timeout);
        },
        [updateParams]
    );

    const handleOrden = (value: string) => {
        setOrden(value);
        updateParams({ orden: value });
    };

    const handlePrecio = () => {
        updateParams({ min, max });
        setShowPrice(false);
    };

    const clearFilters = () => {
        setQ("");
        setOrden("novedad");
        setMin("");
        setMax("");
        startTransition(() => {
            router.push(pathname);
        });
    };

    const hasFilters = q || orden !== "novedad" || min || max;

    return (
        <div className="flex flex-wrap gap-3 items-center">

            {/* Búsqueda */}
            <div className="relative flex-1 min-w-48">
                <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]"
                />
                <input
                    type="text"
                    value={q}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Buscar productos..."
                    className="input pl-9 pr-4"
                />
                {q && (
                    <button
                        onClick={() => handleSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Ordenar */}
            <select
                value={orden}
                onChange={(e) => handleOrden(e.target.value)}
                className="input w-auto cursor-pointer"
            >
                {ORDEN_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {/* Filtro precio */}
            <div className="relative">
                <button
                    onClick={() => setShowPrice((v) => !v)}
                    className={clsx(
                        "btn btn-outline btn-md gap-2",
                        (min || max) && "border-[var(--color-secondary)] text-[var(--color-secondary)]"
                    )}
                >
                    <SlidersHorizontal size={16} />
                    Precio
                    {(min || max) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)]" />
                    )}
                </button>

                {showPrice && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowPrice(false)}
                        />
                        <div className="absolute top-full mt-2 left-0 z-20 bg-[var(--color-surface-bright)] rounded-xl border border-[var(--color-outline-variant)] shadow-[var(--shadow-modal)] p-4 w-64 animate-[scale-in_0.15s_ease-out]">
                            <p className="text-sm font-medium text-[var(--color-on-surface)] mb-3">
                                Rango de precio
                            </p>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="number"
                                    value={min}
                                    onChange={(e) => setMin(e.target.value)}
                                    placeholder="Mínimo"
                                    className="input text-sm"
                                    min={0}
                                />
                                <input
                                    type="number"
                                    value={max}
                                    onChange={(e) => setMax(e.target.value)}
                                    placeholder="Máximo"
                                    className="input text-sm"
                                    min={0}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setMin("");
                                        setMax("");
                                        updateParams({ min: "", max: "" });
                                        setShowPrice(false);
                                    }}
                                    className="btn btn-ghost btn-sm flex-1"
                                >
                                    Limpiar
                                </button>
                                <button
                                    onClick={handlePrecio}
                                    className="btn btn-primary btn-sm flex-1"
                                >
                                    Aplicar
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Limpiar todos los filtros */}
            {hasFilters && (
                <button
                    onClick={clearFilters}
                    className="btn btn-ghost btn-sm gap-1 text-[var(--color-error)]"
                >
                    <X size={14} />
                    Limpiar
                </button>
            )}

            {/* Indicador de carga */}
            {isPending && (
                <span className="text-xs text-[var(--color-on-surface-variant)] animate-pulse">
                    Actualizando...
                </span>
            )}
        </div>
    );
}