"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import type { Category } from "@/types/database";

interface CategoryFilterProps {
    categories: Category[];
    selected: string | null;
}

export default function CategoryFilter({
    categories,
    selected,
}: CategoryFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleChange = (slug: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (slug) {
            params.set("categoria", slug);
        } else {
            params.delete("categoria");
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex gap-2 flex-wrap">
            <button
                onClick={() => handleChange(null)}
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
                    onClick={() => handleChange(cat.slug)}
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