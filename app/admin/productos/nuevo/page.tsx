"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Toggle from "@/components/ui/Toggle";
import ImageUploader from "@/components/admin/ImageUploader";
import toast from "react-hot-toast";
import type { Product, Category } from "@/types/database";

interface Props {
    product?: Product;
    categories: Category[];
}

interface FormData {
    name: string;
    slug: string;
    description: string;
    category_id: string;
    price: string;
    width: string;
    depth: string;
    height: string;
    active: boolean;
    featured: boolean;
}

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

export default function ProductForm({ product, categories }: Props) {
    const router = useRouter();
    const supabase = createClient();
    const isEdit = !!product;

    const [form, setForm] = useState<FormData>({
        name: product?.name ?? "",
        slug: product?.slug ?? "",
        description: product?.description ?? "",
        category_id: product?.category_id ?? "",
        price: product?.price?.toString() ?? "",
        width: product?.dimensions?.width?.toString() ?? "",
        depth: product?.dimensions?.depth?.toString() ?? "",
        height: product?.dimensions?.height?.toString() ?? "",
        active: product?.active ?? true,
        featured: product?.featured ?? false,
    });

    const [images, setImages] = useState<string[]>(product?.images ?? []);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<FormData>>({});

    const update = (field: keyof FormData) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const value = e.target.value;
            setForm((prev) => ({
                ...prev,
                [field]: value,
                // Auto-generar slug al escribir el nombre (solo en creación)
                ...(field === "name" && !isEdit
                    ? { slug: generateSlug(value) }
                    : {}),
            }));
        };

    const validate = (): boolean => {
        const errs: Partial<FormData> = {};
        if (!form.name.trim()) errs.name = "El nombre es obligatorio";
        if (!form.slug.trim()) errs.slug = "El slug es obligatorio";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);

        const payload = {
            name: form.name.trim(),
            slug: form.slug.trim(),
            description: form.description.trim() || null,
            category_id: form.category_id || null,
            price: form.price ? parseFloat(form.price) : null,
            dimensions:
                form.width || form.depth || form.height
                    ? {
                        width: form.width ? parseFloat(form.width) : undefined,
                        depth: form.depth ? parseFloat(form.depth) : undefined,
                        height: form.height ? parseFloat(form.height) : undefined,
                    }
                    : null,
            images,
            active: form.active,
            featured: form.featured,
        };

        if (isEdit) {
            const { error } = await supabase
                .from("products")
                .update(payload as never)
                .eq("id", product.id);

            if (error) {
                toast.error(
                    error.message.includes("slug")
                        ? "El slug ya existe. Usa uno diferente."
                        : "Error al actualizar el producto"
                );
                setLoading(false);
                return;
            }
            toast.success("Producto actualizado");
        } else {
            const { error } = await supabase
                .from("products")
                .insert(payload as never);

            if (error) {
                toast.error(
                    error.message.includes("slug")
                        ? "El slug ya existe. Usa uno diferente."
                        : "Error al crear el producto"
                );
                setLoading(false);
                return;
            }
            toast.success("Producto creado");
        }

        router.push("/admin/productos");
        router.refresh();
    };

    const categoryOptions = categories.map((c) => ({
        value: c.id,
        label: c.name,
    }));

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">

            {/* ── Información básica ──────────────────────────────── */}
            <div className="card p-6 space-y-5">
                <h2 className="font-semibold text-[var(--color-on-surface)]">
                    Información básica
                </h2>

                <Input
                    label="Nombre del producto *"
                    value={form.name}
                    onChange={update("name")}
                    error={errors.name}
                    placeholder="Ej: Mesa Centro Modelo A"
                />

                <Input
                    label="Slug (URL) *"
                    value={form.slug}
                    onChange={update("slug")}
                    error={errors.slug}
                    placeholder="mesa-centro-modelo-a"
                    hint="Se genera automáticamente. Solo letras minúsculas, números y guiones."
                />

                <Textarea
                    label="Descripción"
                    value={form.description}
                    onChange={update("description")}
                    placeholder="Describe el producto..."
                    rows={3}
                    hint="Opcional"
                />

                <Select
                    label="Categoría"
                    value={form.category_id}
                    onChange={update("category_id")}
                    options={categoryOptions}
                    placeholder="Seleccionar categoría (opcional)"
                />
            </div>

            {/* ── Precio ─────────────────────────────────────────── */}
            <div className="card p-6 space-y-5">
                <h2 className="font-semibold text-[var(--color-on-surface)]">
                    Precio
                </h2>
                <Input
                    label="Precio"
                    type="number"
                    value={form.price}
                    onChange={update("price")}
                    placeholder="0.00"
                    hint="Opcional — si no se define se mostrará 'Precio a consultar'"
                    min={0}
                    step={0.01}
                />
            </div>

            {/* ── Dimensiones ────────────────────────────────────── */}
            <div className="card p-6 space-y-5">
                <h2 className="font-semibold text-[var(--color-on-surface)]">
                    Dimensiones{" "}
                    <span className="text-sm font-normal text-[var(--color-on-surface-variant)]">
                        (en mm — opcional)
                    </span>
                </h2>
                <div className="grid grid-cols-3 gap-4">
                    <Input
                        label="Ancho"
                        type="number"
                        value={form.width}
                        onChange={update("width")}
                        placeholder="600"
                        min={0}
                    />
                    <Input
                        label="Profundo"
                        type="number"
                        value={form.depth}
                        onChange={update("depth")}
                        placeholder="400"
                        min={0}
                    />
                    <Input
                        label="Alto"
                        type="number"
                        value={form.height}
                        onChange={update("height")}
                        placeholder="450"
                        min={0}
                    />
                </div>
            </div>

            {/* ── Imágenes ───────────────────────────────────────── */}
            <div className="card p-6">
                <ImageUploader
                    images={images}
                    onChange={setImages}
                    folder="products"
                    maxImages={10}
                />
            </div>

            {/* ── Visibilidad ────────────────────────────────────── */}
            <div className="card p-6 space-y-4">
                <h2 className="font-semibold text-[var(--color-on-surface)]">
                    Visibilidad
                </h2>
                <Toggle
                    checked={form.active}
                    onChange={(v) => setForm((p) => ({ ...p, active: v }))}
                    label="Producto activo"
                    description="Los clientes pueden ver y pedir este producto"
                />
                <Toggle
                    checked={form.featured}
                    onChange={(v) => setForm((p) => ({ ...p, featured: v }))}
                    label="Producto destacado"
                    description="Aparece en la sección de destacados del inicio"
                />
            </div>

            {/* ── Acciones ───────────────────────────────────────── */}
            <div className="flex gap-3 justify-end pb-8">
                <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={() => router.back()}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={loading}
                >
                    {isEdit ? "Guardar cambios" : "Crear producto"}
                </Button>
            </div>
        </form>
    );
}