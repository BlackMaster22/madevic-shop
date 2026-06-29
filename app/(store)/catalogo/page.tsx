import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import ProductGrid from "@/components/store/ProductGrid";
import CategoryFilter from "@/components/store/CategoryFilter";
import CatalogFilters from "@/components/store/CatalogFilters";
import type { Product, Category } from "@/types/database";

interface CatalogPageProps {
    searchParams: Promise<{
        q?: string;
        categoria?: string;
        orden?: string;
        min?: string;
        max?: string;
    }>;
}

export const metadata = {
    title: "Catálogo",
    description: "Explora toda la colección de mobiliario artesanal MADEVIC",
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
    const params = await searchParams;
    const supabase = await createClient();

    // ── Cargar categorías ─────────────────────────────────────
    const { data: categoriesRaw } = await supabase
        .from("categories")
        .select("*")
        .eq("active", true)
        .order("sort_order");

    const categories = (categoriesRaw ?? []) as Category[];

    // ── Construir query de productos ──────────────────────────
    let query = supabase
        .from("products")
        .select("*, category:categories(*)")
        .eq("active", true);

    if (params.q) {
        query = query.ilike("name", `%${params.q}%`);
    }

    if (params.categoria) {
        const cat = categories.find((c) => c.slug === params.categoria);
        if (cat) query = query.eq("category_id", cat.id);
    }

    if (params.min) {
        query = query.gte("price", parseFloat(params.min));
    }

    if (params.max) {
        query = query.lte("price", parseFloat(params.max));
    }

    switch (params.orden) {
        case "precio-asc":
            query = query.order("price", { ascending: true, nullsFirst: false });
            break;
        case "precio-desc":
            query = query.order("price", { ascending: false, nullsFirst: false });
            break;
        default:
            query = query.order("created_at", { ascending: false });
            break;
    }

    const { data: productsRaw } = await query;
    const products = (productsRaw ?? []) as Product[];

    return (
        <div className="section">
            <div className="container-madevic">

                <div className="mb-8">
                    <p className="text-sm font-medium text-[var(--color-secondary)] uppercase tracking-widest mb-1">
                        Colección completa
                    </p>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--color-primary)]">
                        Catálogo
                    </h1>
                </div>

                <div className="space-y-4 mb-8">
                    <Suspense fallback={null}>
                        <CategoryFilter
                            categories={categories}
                            selected={params.categoria ?? null}
                            onChange={() => { }}
                        />
                    </Suspense>

                    <CatalogFilters
                        initialQ={params.q ?? ""}
                        initialOrden={params.orden ?? "novedad"}
                        initialMin={params.min ?? ""}
                        initialMax={params.max ?? ""}
                    />
                </div>

                <div className="flex items-center justify-between mb-5">
                    <p className="text-sm text-[var(--color-on-surface-variant)]">
                        {products.length}{" "}
                        {products.length === 1 ? "producto encontrado" : "productos encontrados"}
                    </p>
                </div>

                <ProductGrid products={products} />
            </div>
        </div>
    );
}