import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";
import type { Product, Category } from "@/types/database";

interface Props {
    params: Promise<{ id: string }>;
}

export const metadata = { title: "Editar producto" };

export default async function EditarProductoPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: productRaw } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

    if (!productRaw) notFound();

    const { data: categoriesRaw } = await supabase
        .from("categories")
        .select("*")
        .eq("active", true)
        .order("sort_order");

    const product = productRaw as unknown as Product;
    const categories = (categoriesRaw ?? []) as unknown as Category[];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-[var(--color-primary)]">
                    Editar producto
                </h1>
                <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
                    {product.name}
                </p>
            </div>
            <ProductForm product={product} categories={categories} />
        </div>
    );
}