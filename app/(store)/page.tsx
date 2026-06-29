import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/store/ProductCard";
import FeaturedCarousel from "@/components/store/FeaturedCarousel";
import type { Product, Category, FeaturedGallery } from "@/types/database";

export default async function HomePage() {
    const supabase = await createClient();

    // Productos destacados
    const { data: featuredProducts } = await supabase
        .from("products")
        .select("*, category:categories(*)")
        .eq("active", true)
        .eq("featured", true)
        .order("sort_order")
        .limit(8);

    // Categorías activas
    const { data: categories } = await supabase
        .from("categories")
        .select("*")
        .eq("active", true)
        .order("sort_order")
        .limit(6);

    // Galería destacada para el carrusel
    const { data: gallery } = await supabase
        .from("featured_gallery")
        .select("*")
        .eq("active", true)
        .order("sort_order");

    return (
        <div>
            {/* ── Hero ─────────────────────────────────────────────── */}
            <section className="bg-wood-pattern section">
                <div className="container-madevic">
                    <div className="max-w-2xl">
                        <p className="text-sm font-medium text-[var(--color-secondary)] uppercase tracking-widest mb-3">
                            Industria Cubana del Mueble DUJO
                        </p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-[var(--color-primary)] leading-tight mb-6">
                            Esencia de
                            <br />
                            la Madera
                        </h1>
                        <p className="text-lg text-[var(--color-on-surface-variant)] mb-8 leading-relaxed">
                            Mobiliario artesanal cubano elaborado con recortería de madera.
                            Piezas únicas hechas a pedido, con la calidad y tradición de
                            MADEVIC.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/catalogo"
                                className="btn btn-primary btn-lg"
                            >
                                Ver catálogo
                                <ArrowRight size={18} />
                            </Link>
                            <Link
                                href="/register"
                                className="btn btn-outline btn-lg"
                            >
                                Crear cuenta
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Carrusel de productos terminados ─────────────────── */}
            {gallery && gallery.length > 0 && (
                <section className="section bg-[var(--color-surface-container-low)]">
                    <div className="container-madevic">
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <p className="text-sm font-medium text-[var(--color-secondary)] uppercase tracking-widest mb-1">
                                    Galería
                                </p>
                                <h2 className="text-3xl font-display font-bold text-[var(--color-primary)]">
                                    Productos Destacados
                                </h2>
                            </div>
                        </div>
                        <FeaturedCarousel items={gallery as FeaturedGallery[]} />
                    </div>
                </section>
            )}

            {/* ── Categorías ───────────────────────────────────────── */}
            {categories && categories.length > 0 && (
                <section className="section">
                    <div className="container-madevic">
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <p className="text-sm font-medium text-[var(--color-secondary)] uppercase tracking-widest mb-1">
                                    Colecciones
                                </p>
                                <h2 className="text-3xl font-display font-bold text-[var(--color-primary)]">
                                    Nuestras Categorías
                                </h2>
                            </div>
                            <Link
                                href="/catalogo"
                                className="hidden sm:flex items-center gap-1 text-sm font-medium text-[var(--color-secondary)] hover:underline"
                            >
                                Ver todo
                                <ArrowRight size={16} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {(categories as Category[]).map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={`/catalogo?categoria=${cat.slug}`}
                                    className="card p-6 flex flex-col gap-2 hover:border-[var(--color-secondary)] transition-colors group"
                                >
                                    <h3 className="font-display font-bold text-[var(--color-primary)] group-hover:text-[var(--color-secondary)] transition-colors">
                                        {cat.name}
                                    </h3>
                                    {cat.description && (
                                        <p className="text-sm text-[var(--color-on-surface-variant)] line-clamp-2">
                                            {cat.description}
                                        </p>
                                    )}
                                    <span className="text-sm font-medium text-[var(--color-secondary)] flex items-center gap-1 mt-auto">
                                        Explorar <ArrowRight size={14} />
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Productos destacados ──────────────────────────────── */}
            {featuredProducts && featuredProducts.length > 0 && (
                <section className="section bg-[var(--color-surface)]">
                    <div className="container-madevic">
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <p className="text-sm font-medium text-[var(--color-secondary)] uppercase tracking-widest mb-1">
                                    Selección
                                </p>
                                <h2 className="text-3xl font-display font-bold text-[var(--color-primary)]">
                                    Más Pedidos
                                </h2>
                            </div>
                            <Link
                                href="/catalogo"
                                className="hidden sm:flex items-center gap-1 text-sm font-medium text-[var(--color-secondary)] hover:underline"
                            >
                                Ver catálogo completo
                                <ArrowRight size={16} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {(featuredProducts as Product[]).map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        <div className="text-center mt-10">
                            <Link href="/catalogo" className="btn btn-outline btn-lg">
                                Ver todos los productos
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ── CTA final ────────────────────────────────────────── */}
            <section className="section gradient-madevic">
                <div className="container-madevic text-center">
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                        ¿Buscas algo específico?
                    </h2>
                    <p className="text-white/80 mb-8 max-w-lg mx-auto">
                        Todos nuestros muebles se fabrican bajo pedido. Explora el
                        catálogo completo y encuentra la pieza perfecta para tu hogar.
                    </p>
                    <Link href="/catalogo" className="btn btn-lg bg-white text-[var(--color-primary)] hover:bg-[var(--color-primary-fixed)]">
                        Explorar catálogo completo
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </div>
    );
}