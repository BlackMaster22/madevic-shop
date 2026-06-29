"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    Star,
    StarOff,
    Package,
    Search,
} from "lucide-react";
import { clsx } from "clsx";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import type { Product, Category } from "@/types/database";
import toast from "react-hot-toast";

interface Props {
    initialProducts: Product[];
    categories: Category[];
}

export default function ProductsTableClient({
    initialProducts,
    categories,
}: Props) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState("");
    const [deleteModal, setDeleteModal] = useState<Product | null>(null);
    const [deleting, setDeleting] = useState(false);

    const supabase = createClient();

    // ── Filtrado local ──────────────────────────────────────────
    const filtered = products.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchCat = catFilter ? p.category_id === catFilter : true;
        return matchSearch && matchCat;
    });

    // ── Toggle activo ───────────────────────────────────────────
    const toggleActive = async (product: Product) => {
        const { error } = await supabase
            .from("products")
            .update({ active: !product.active } as never)
            .eq("id", product.id);

        if (error) {
            toast.error("Error al actualizar el producto");
            return;
        }

        setProducts((prev) =>
            prev.map((p) =>
                p.id === product.id ? { ...p, active: !p.active } : p
            )
        );
        toast.success(
            product.active ? "Producto desactivado" : "Producto activado"
        );
    };

    // ── Toggle destacado ────────────────────────────────────────
    const toggleFeatured = async (product: Product) => {
        const { error } = await supabase
            .from("products")
            .update({ featured: !product.featured } as never)
            .eq("id", product.id);

        if (error) {
            toast.error("Error al actualizar el producto");
            return;
        }

        setProducts((prev) =>
            prev.map((p) =>
                p.id === product.id ? { ...p, featured: !p.featured } : p
            )
        );
        toast.success(
            product.featured ? "Quitado de destacados" : "Marcado como destacado"
        );
    };

    // ── Eliminar ────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteModal) return;
        setDeleting(true);

        const { error } = await supabase
            .from("products")
            .delete()
            .eq("id", deleteModal.id);

        if (error) {
            toast.error("Error al eliminar el producto");
        } else {
            setProducts((prev) => prev.filter((p) => p.id !== deleteModal.id));
            toast.success("Producto eliminado");
            setDeleteModal(null);
        }
        setDeleting(false);
    };

    return (
        <>
            {/* ── Filtros ──────────────────────────────────────────── */}
            <div className="flex gap-3 mb-5 flex-wrap">
                <div className="relative flex-1 min-w-48">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]"
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar productos..."
                        className="input pl-9"
                    />
                </div>
                <select
                    value={catFilter}
                    onChange={(e) => setCatFilter(e.target.value)}
                    className="input w-auto cursor-pointer"
                >
                    <option value="">Todas las categorías</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* ── Tabla ────────────────────────────────────────────── */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Categoría</th>
                                <th>Precio</th>
                                <th>Estado</th>
                                <th>Destacado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-2 text-[var(--color-on-surface-variant)]">
                                            <Package size={32} className="text-[var(--color-outline)]" />
                                            <p className="text-sm">No se encontraron productos</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((product) => (
                                    <tr key={product.id}>
                                        {/* Imagen + nombre */}
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--color-surface-container)] flex-shrink-0">
                                                    {product.images?.[0] ? (
                                                        <Image
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            width={48}
                                                            height={48}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package
                                                                size={18}
                                                                className="text-[var(--color-outline)]"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-[var(--color-on-surface)] truncate max-w-48">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-xs text-[var(--color-on-surface-variant)]">
                                                        {product.images?.length ?? 0} imagen
                                                        {product.images?.length !== 1 ? "es" : ""}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Categoría */}
                                        <td>
                                            <span className="text-sm text-[var(--color-on-surface-variant)]">
                                                {(product.category as unknown as Category)?.name ?? "—"}
                                            </span>
                                        </td>

                                        {/* Precio */}
                                        <td>
                                            {product.price !== null ? (
                                                <span className="text-sm font-semibold text-[var(--color-secondary)]">
                                                    ${product.price.toFixed(2)}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-[var(--color-on-surface-variant)] italic">
                                                    Sin precio
                                                </span>
                                            )}
                                        </td>

                                        {/* Estado */}
                                        <td>
                                            <button
                                                onClick={() => toggleActive(product)}
                                                className="flex items-center gap-1.5"
                                            >
                                                <Badge
                                                    variant={product.active ? "success" : "default"}
                                                >
                                                    {product.active ? "Activo" : "Inactivo"}
                                                </Badge>
                                            </button>
                                        </td>

                                        {/* Destacado */}
                                        <td>
                                            <button
                                                onClick={() => toggleFeatured(product)}
                                                className={clsx(
                                                    "p-1.5 rounded-lg transition-colors",
                                                    product.featured
                                                        ? "text-[var(--color-secondary)] bg-[var(--color-secondary-fixed)]"
                                                        : "text-[var(--color-outline)] hover:text-[var(--color-secondary)]"
                                                )}
                                                title={
                                                    product.featured
                                                        ? "Quitar de destacados"
                                                        : "Marcar como destacado"
                                                }
                                            >
                                                {product.featured ? (
                                                    <Star size={16} className="fill-current" />
                                                ) : (
                                                    <StarOff size={16} />
                                                )}
                                            </button>
                                        </td>

                                        {/* Acciones */}
                                        <td>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => toggleActive(product)}
                                                    className="p-1.5 rounded-lg text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] transition-colors"
                                                    title={product.active ? "Desactivar" : "Activar"}
                                                >
                                                    {product.active ? (
                                                        <EyeOff size={16} />
                                                    ) : (
                                                        <Eye size={16} />
                                                    )}
                                                </button>
                                                <Link
                                                    href={`/admin/productos/${product.id}/editar`}
                                                    className="p-1.5 rounded-lg text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] transition-colors"
                                                    title="Editar"
                                                >
                                                    <Pencil size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteModal(product)}
                                                    className="p-1.5 rounded-lg text-[var(--color-error)] hover:bg-[var(--color-error-container)] transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Modal confirmación eliminar ───────────────────────── */}
            <Modal
                open={!!deleteModal}
                onClose={() => setDeleteModal(null)}
                title="Eliminar producto"
                size="sm"
            >
                <p className="text-sm text-[var(--color-on-surface-variant)] mb-6">
                    ¿Estás seguro de que quieres eliminar{" "}
                    <strong className="text-[var(--color-on-surface)]">
                        {deleteModal?.name}
                    </strong>
                    ? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3 justify-end">
                    <Button
                        variant="ghost"
                        size="md"
                        onClick={() => setDeleteModal(null)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="danger"
                        size="md"
                        loading={deleting}
                        onClick={handleDelete}
                    >
                        Eliminar
                    </Button>
                </div>
            </Modal>
        </>
    );
}