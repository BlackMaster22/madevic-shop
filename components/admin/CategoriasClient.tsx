"use client";

import { useState } from "react";
import Image from "next/image";
import {
    Plus,
    Pencil,
    Trash2,
    GripVertical,
    FolderOpen,
    X,
    Save,
} from "lucide-react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Toggle from "@/components/ui/Toggle";
import Modal from "@/components/ui/Modal";
import ImageUploader from "@/components/admin/ImageUploader";
import { Badge } from "@/components/ui/Badge";
import type { Category } from "@/types/database";
import toast from "react-hot-toast";

interface Props {
    initialCategories: Category[];
}

interface CategoryForm {
    name: string;
    slug: string;
    description: string;
    active: boolean;
    image_url: string;
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

// ── Fila sortable ─────────────────────────────────────────────
function SortableRow({
    category,
    onEdit,
    onDelete,
    onToggle,
}: {
    category: Category;
    onEdit: (c: Category) => void;
    onDelete: (c: Category) => void;
    onToggle: (c: Category) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: category.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <tr ref={setNodeRef} style={style}>
            {/* Handle */}
            <td className="w-10">
                <button
                    {...attributes}
                    {...listeners}
                    className="p-1 text-[var(--color-outline)] hover:text-[var(--color-on-surface-variant)] cursor-grab"
                >
                    <GripVertical size={16} />
                </button>
            </td>

            {/* Imagen + nombre */}
            <td>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-[var(--color-surface-container)] flex-shrink-0">
                        {category.image_url ? (
                            <Image
                                src={category.image_url}
                                alt={category.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <FolderOpen size={16} className="text-[var(--color-outline)]" />
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-[var(--color-on-surface)]">
                            {category.name}
                        </p>
                        <p className="text-xs text-[var(--color-on-surface-variant)] font-mono">
                            /{category.slug}
                        </p>
                    </div>
                </div>
            </td>

            {/* Descripción */}
            <td>
                <p className="text-sm text-[var(--color-on-surface-variant)] line-clamp-1 max-w-xs">
                    {category.description ?? "—"}
                </p>
            </td>

            {/* Estado */}
            <td>
                <button onClick={() => onToggle(category)}>
                    <Badge variant={category.active ? "success" : "default"}>
                        {category.active ? "Activa" : "Inactiva"}
                    </Badge>
                </button>
            </td>

            {/* Acciones */}
            <td>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onEdit(category)}
                        className="p-1.5 rounded-lg text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] transition-colors"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(category)}
                        className="p-1.5 rounded-lg text-[var(--color-error)] hover:bg-[var(--color-error-container)] transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ── Componente principal ──────────────────────────────────────
export default function CategoriasClient({ initialCategories }: Props) {
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState<Category | null>(null);
    const [editing, setEditing] = useState<Category | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [form, setForm] = useState<CategoryForm>({
        name: "",
        slug: "",
        description: "",
        active: true,
        image_url: "",
    });
    const [images, setImages] = useState<string[]>([]);

    const supabase = createClient();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const openCreate = () => {
        setEditing(null);
        setForm({ name: "", slug: "", description: "", active: true, image_url: "" });
        setImages([]);
        setFormModal(true);
    };

    const openEdit = (category: Category) => {
        setEditing(category);
        setForm({
            name: category.name,
            slug: category.slug,
            description: category.description ?? "",
            active: category.active,
            image_url: category.image_url ?? "",
        });
        setImages(category.image_url ? [category.image_url] : []);
        setFormModal(true);
    };

    const updateField = (field: keyof CategoryForm) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const value = e.target.value;
            setForm((prev) => ({
                ...prev,
                [field]: value,
                ...(field === "name" && !editing
                    ? { slug: generateSlug(value) }
                    : {}),
            }));
        };

    // ── Guardar categoría ───────────────────────────────────────
    const handleSave = async () => {
        if (!form.name.trim()) {
            toast.error("El nombre es obligatorio");
            return;
        }
        setSaving(true);

        const payload = {
            name: form.name.trim(),
            slug: form.slug.trim(),
            description: form.description.trim() || null,
            active: form.active,
            image_url: images[0] ?? null,
        };

        if (editing) {
            const { data, error } = await supabase
                .from("categories")
                .update(payload as never)
                .eq("id", editing.id)
                .select()
                .single();

            if (error) {
                toast.error("Error al actualizar la categoría");
            } else {
                setCategories((prev) =>
                    prev.map((c) =>
                        c.id === editing.id ? (data as unknown as Category) : c
                    )
                );
                toast.success("Categoría actualizada");
                setFormModal(false);
            }
        } else {
            const count = categories.length;
            const { data, error } = await supabase
                .from("categories")
                .insert({ ...payload, sort_order: count } as never)
                .select()
                .single();

            if (error) {
                toast.error(
                    error.message.includes("slug")
                        ? "El slug ya existe"
                        : "Error al crear la categoría"
                );
            } else {
                setCategories((prev) => [...prev, data as unknown as Category]);
                toast.success("Categoría creada");
                setFormModal(false);
            }
        }
        setSaving(false);
    };

    // ── Toggle activo ───────────────────────────────────────────
    const handleToggle = async (category: Category) => {
        const { error } = await supabase
            .from("categories")
            .update({ active: !category.active } as never)
            .eq("id", category.id);

        if (!error) {
            setCategories((prev) =>
                prev.map((c) =>
                    c.id === category.id ? { ...c, active: !c.active } : c
                )
            );
        }
    };

    // ── Eliminar ────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteModal) return;
        setDeleting(true);

        const { error } = await supabase
            .from("categories")
            .delete()
            .eq("id", deleteModal.id);

        if (error) {
            toast.error("Error al eliminar. Puede tener productos asociados.");
        } else {
            setCategories((prev) => prev.filter((c) => c.id !== deleteModal.id));
            toast.success("Categoría eliminada");
            setDeleteModal(null);
        }
        setDeleting(false);
    };

    // ── Reordenar drag & drop ───────────────────────────────────
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = categories.findIndex((c) => c.id === active.id);
        const newIndex = categories.findIndex((c) => c.id === over.id);
        const reordered = arrayMove(categories, oldIndex, newIndex);

        setCategories(reordered);

        // Actualizar sort_order en Supabase
        await Promise.all(
            reordered.map((cat, i) =>
                supabase
                    .from("categories")
                    .update({ sort_order: i } as never)
                    .eq("id", cat.id)
            )
        );
    };

    return (
        <>
            {/* Botón crear */}
            <div className="flex justify-end mb-5">
                <Button variant="primary" size="md" onClick={openCreate}>
                    <Plus size={18} />
                    Nueva categoría
                </Button>
            </div>

            {/* Tabla */}
            <div className="card overflow-hidden">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={categories.map((c) => c.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th className="w-10" />
                                    <th>Categoría</th>
                                    <th>Descripción</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12">
                                            <div className="flex flex-col items-center gap-2 text-[var(--color-on-surface-variant)]">
                                                <FolderOpen
                                                    size={32}
                                                    className="text-[var(--color-outline)]"
                                                />
                                                <p className="text-sm">No hay categorías aún</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    categories.map((cat) => (
                                        <SortableRow
                                            key={cat.id}
                                            category={cat}
                                            onEdit={openEdit}
                                            onDelete={setDeleteModal}
                                            onToggle={handleToggle}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </SortableContext>
                </DndContext>
            </div>

            {/* ── Modal formulario ────────────────────────────────── */}
            <Modal
                open={formModal}
                onClose={() => setFormModal(false)}
                title={editing ? "Editar categoría" : "Nueva categoría"}
                size="md"
            >
                <div className="space-y-4">
                    <Input
                        label="Nombre *"
                        value={form.name}
                        onChange={updateField("name")}
                        placeholder="Ej: Mesas bajas"
                    />
                    <Input
                        label="Slug *"
                        value={form.slug}
                        onChange={updateField("slug")}
                        placeholder="mesas-bajas"
                        hint="Solo letras minúsculas, números y guiones"
                    />
                    <Textarea
                        label="Descripción"
                        value={form.description}
                        onChange={updateField("description")}
                        placeholder="Descripción opcional..."
                        rows={2}
                    />
                    <ImageUploader
                        images={images}
                        onChange={setImages}
                        folder="categories"
                        maxImages={1}
                    />
                    <Toggle
                        checked={form.active}
                        onChange={(v) => setForm((p) => ({ ...p, active: v }))}
                        label="Categoría activa"
                        description="Visible en el catálogo"
                    />
                    <div className="flex gap-3 justify-end pt-2">
                        <Button
                            variant="ghost"
                            size="md"
                            onClick={() => setFormModal(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="primary"
                            size="md"
                            loading={saving}
                            onClick={handleSave}
                        >
                            <Save size={16} />
                            {editing ? "Guardar cambios" : "Crear categoría"}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* ── Modal eliminar ───────────────────────────────────── */}
            <Modal
                open={!!deleteModal}
                onClose={() => setDeleteModal(null)}
                title="Eliminar categoría"
                size="sm"
            >
                <p className="text-sm text-[var(--color-on-surface-variant)] mb-6">
                    ¿Eliminar{" "}
                    <strong className="text-[var(--color-on-surface)]">
                        {deleteModal?.name}
                    </strong>
                    ? Los productos asociados quedarán sin categoría.
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