"use client";

import { clsx } from "clsx";
import type { Category } from "@/types/database";

interface CategoryFilterProps {
    categories: Category[];
    selected: string | null;
    onChange: (slug: string | null) => void;
}

export default function CategoryFilter({
    categories,
    selected,
    onChange,
}: CategoryFilterProps) {
    return (
        <div className="flex gap-2 flex-wrap">
            {/* Opción "Todos" */}
            <button
                onClick={() => onChange(null)}
                className={clsx(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border",
                    selected === null
                        ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                        : "bg-transparent text-[var(--color-on-surface)] border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container)]"
                )}
            >
                Todos
            </button>

            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onChange(cat.slug)}
                    className={clsx(
                        "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border",
                        selected === cat.slug
                            ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                            : "bg-transparent text-[var(--color-on-surface)] border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container)]"
                    )}
                >
                    {cat.name}
                </button>
            ))}
        </div>
    );
}