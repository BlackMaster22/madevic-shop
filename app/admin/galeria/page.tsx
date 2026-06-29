import { createClient } from "@/lib/supabase/server";
import GaleriaClient from "@/components/admin/GaleriaClient";
import type { FeaturedGallery } from "@/types/database";

export const metadata = { title: "Galería destacada" };

export default async function GaleriaPage() {
    const supabase = await createClient();

    const { data: galleryRaw } = await supabase
        .from("featured_gallery")
        .select("*")
        .order("sort_order");

    const gallery = (galleryRaw ?? []) as unknown as FeaturedGallery[];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-[var(--color-primary)]">
                    Galería destacada
                </h1>
                <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
                    Imágenes del carrusel en la página de inicio
                </p>
            </div>
            <GaleriaClient initialItems={gallery} />
        </div>
    );
}