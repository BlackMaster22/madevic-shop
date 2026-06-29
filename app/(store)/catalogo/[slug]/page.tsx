import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductDetailClient from "@/components/store/ProductDetailClient";
import type { Product } from "@/types/database";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data } = await supabase
        .from("products")
        .select("name, description")
        .eq("slug", slug)
        .single();

    const product = data as { name: string; description: string } | null;

    return {
        title: product?.name ?? "Producto",
        description: product?.description ?? "",
    };
}

export default async function ProductDetailPage({ params }: Props) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: productRaw } = await supabase
        .from("products")
        .select("*, category:categories(*)")
        .eq("slug", slug)
        .eq("active", true)
        .single();

    if (!productRaw) notFound();

    const product = productRaw as unknown as Product;

    const { data: relatedRaw } = await supabase
        .from("products")
        .select("*, category:categories(*)")
        .eq("active", true)
        .eq("category_id", product.category_id ?? "")
        .neq("id", product.id)
        .limit(4);

    const related = (relatedRaw ?? []) as unknown as Product[];

    return (
        <div className="section">
            <div className="container-madevic">
                <ProductDetailClient
                    product={product}
                    related={related}
                />
            </div>
        </div>
    );
}