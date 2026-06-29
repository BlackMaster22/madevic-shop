import ProductCard from "@/components/store/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import type { Product } from "@/types/database";

interface ProductGridProps {
    products: Product[];
    isLoading?: boolean;
    emptyMessage?: string;
}

export default function ProductGrid({
    products,
    isLoading = false,
    emptyMessage = "No se encontraron productos",
}: ProductGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="w-20 h-20 rounded-full bg-[var(--color-surface-container)] flex items-center justify-center">
                    <span className="text-3xl">🪵</span>
                </div>
                <div>
                    <p className="font-medium text-[var(--color-on-surface)]">
                        {emptyMessage}
                    </p>
                    <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
                        Prueba con otros filtros o categorías
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}