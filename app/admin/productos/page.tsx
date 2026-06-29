import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Plus, Package } from "lucide-react";
import ProductsTableClient from "@/components/admin/ProductsTableClient";
import type { Product, Category } from "@/types/database";

export const metadata = { title: "Productos" };

export default async function ProductosPage() {
    const supabase = await createClient();

    const { data: productsRaw } = await supabase
        .from("products")
        .select("*, category:categories(*)")
        .order("created_at", { ascending: false });

    const { data: categoriesRaw } = await supabase
        .from("categories")
        .select("*")
        .eq("active", true)
        .order("sort_order");

    const products = (productsRaw ?? []) as unknown as Product[];
    const categories = (categoriesRaw ?? []) as unknown as Category[];

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-[var(--color-primary)]">
                        Productos
                    </h1>
                    <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
                        {products.length} productos en total
                    </p>
                </div>
                <Link href="/admin/productos/nuevo" className="btn btn-primary btn-md">
                    <Plus size={18} />
                    Nuevo producto
                </Link>
            </div>

            <ProductsTableClient
                initialProducts={products}
                categories={categories}
            />
        </div>
    );
}