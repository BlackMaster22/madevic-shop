import { createClient } from "@/lib/supabase/server";
import CategoriasClient from "@/components/admin/CategoriasClient";
import type { Category } from "@/types/database";

export const metadata = { title: "Categorías" };

export default async function CategoriasPage() {
    const supabase = await createClient();

    const { data: categoriesRaw } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");

    const categories = (categoriesRaw ?? []) as unknown as Category[];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-[var(--color-primary)]">
                    Categorías
                </h1>
                <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
                    Gestiona las categorías del catálogo
                </p>
            </div>
            <CategoriasClient initialCategories={categories} />
        </div>
    );
}