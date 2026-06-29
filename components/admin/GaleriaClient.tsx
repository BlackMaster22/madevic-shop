"use client";

import { useState } from "react";
import Image from "next/image";
import {
    Plus,
    Trash2,
    GripVertical,
    ImageIcon,
    Save,
    X,
    Eye,
    EyeOff,
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
    rectSortingStrategy,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { clsx } from "clsx";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Toggle from "@/components/ui/Toggle";
import Modal from "@/components/ui/Modal";
import ImageUploader from "@/components/admin/ImageUploader";
import type { FeaturedGallery } from "@/types/database";
import toast from "react-hot-toast";

interface Props {
    initialItems: FeaturedGallery[];
}

// ── Tarjeta sortable ──────────────────────────────────────────
function SortableGalleryCard({
    item,
    onEdit,
    onDelete,
    onToggle,
}: {
    item: FeaturedGallery;
    onEdit: (i: FeaturedGallery) => void;
    onDelete: (i: FeaturedGallery) => void;
    onToggle: (i: FeaturedGallery) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={clsx(
                "card overflow-hidden group",
                isDragging && "opacity-50"
            )}
        >
            {/* Imagen */}
            <div className="relative aspect-video bg-[var(--color-surface-container)]">
                {item.image_url ? (
                    <Image
                        src={item.image_url}
                        alt={item.title ?? "Imagen galería"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={32} className="text-[var(--color-outline)]" />
                    </div>
                )}

                {/* Badge inactiva */}
                {!item.active && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">Inactiva</span>
                    </div>
                )}

                {/* Handle drag */}
                <button
                    {...attributes}
                    {...listeners}
                    className="absolute top-2 left-2 w-8 h-8 rounded-lg bg-black/30 hover:bg-black/50 text-white flex items-center justify-center cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <GripVertical size={16} />
                </button>
            </div>

            {/* Info */}
            <div className="p-4">
                {item.title && (
                    <p className="text-sm font-semibold text-[var(--color-on-surface)] truncate">
                        {item.title}
                    </p>
                )}
                {item.subtitle && (
                    <p className="text-xs text-[var(--color-on-surface-variant)] truncate mt-0.5">
                        {item.subtitle}
                    </p>
                )}

                {/* Acciones */}
                <div className="flex items-center gap-2 mt-3">
                    <button
                        onClick={() => onToggle(item)}
                        className="p-1.5 rounded-lg text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] transition-colors"
                        title={item.active ? "Desactivar" : "Activar"}
                    >
                        {item.active ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                        onClick={() => onEdit(item)}
                        className="flex-1 btn btn-ghost btn-sm text-xs"
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => onDelete(item)}
                        className="p-1.5 rounded-lg text-[var(--color-error)] hover:bg-[var(--color-error-container)] transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Componente principal ──────────────────────────────────────
export default function GaleriaClient({ initialItems }: Props) {
    const [items, setItems] = useState<FeaturedGallery[]>(initialItems);
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState<FeaturedGallery | null>(null);
    const [editing, setEditing] = useState<FeaturedGallery | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [form, setForm] = useState({
        title: "",
        subtitle: "",
        active: true,
    });

    const supabase = createClient();
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const openCreate = () => {
        setEditing(null);
        setForm({ title: "", subtitle: "", active: true });
        setImages([]);
        setFormModal(true);
    };

    const openEdit = (item: FeaturedGallery) => {
        setEditing(item);
        setForm({
            title: item.title ?? "",
            subtitle: item.subtitle ?? "",
            active: item.active,
        });
        setImages(item.image_url ? [item.image_url] : []);
        setFormModal(true);
    };

    // ── Guardar ─────────────────────────────────────────────────
    const handleSave = async () => {
        if (!images[0]) {
            toast.error("Debes subir una imagen");
            return;
        }
        setSaving(true);

        const payload = {
            title: form.title.trim() || null,
            subtitle: form.subtitle.trim() || null,
            image_url: images[0],
            active: form.active,
        };

        if (editing) {
            const { data, error } = await supabase
                .from("featured_gallery")
                .update(payload as never)
                .eq("id", editing.id)
                .select()
                .single();

            if (error) {
                toast.error("Error al actualizar");
            } else {
                setItems((prev) =>
                    prev.map((i) =>
                        i.id === editing.id ? (data as unknown as FeaturedGallery) : i
                    )
                );
                toast.success("Imagen actualizada");
                setFormModal(false);
            }
        } else {
            const { data, error } = await supabase
                .from("featured_gallery")
                .insert({ ...payload, sort_order: items.length } as never)
                .select()
                .single();

            if (error) {
                toast.error("Error al crear");
            } else {
                setItems((prev) => [...prev, data as unknown as FeaturedGallery]);
                toast.success("Imagen añadida a la galería");
                setFormModal(false);
            }
        }
        setSaving(false);
    };

    // ── Toggle activo ───────────────────────────────────────────
    const handleToggle = async (item: FeaturedGallery) => {
        const { error } = await supabase
            .from("featured_gallery")
            .update({ active: !item.active } as never)
            .eq("id", item.id);

        if (!error) {
            setItems((prev) =>
                prev.map((i) =>
                    i.id === item.id ? { ...i, active: !i.active } : i
                )
            );
            toast.success(item.active ? "Imagen desactivada" : "Imagen activada");
        }
    };

    // ── Eliminar ────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteModal) return;
        setDeleting(true);

        const { error } = await supabase
            .from("featured_gallery")
            .delete()
            .eq("id", deleteModal.id);

        if (error) {
            toast.error("Error al eliminar");
        } else {
            setItems((prev) => prev.filter((i) => i.id !== deleteModal.id));
            toast.success("Imagen eliminada");
            setDeleteModal(null);
        }
        setDeleting(false);
    };

    // ── Reordenar ───────────────────────────────────────────────
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);

        setItems(reordered);

        await Promise.all(
            reordered.map((item, i) =>
                supabase
                    .from("featured_gallery")
                    .update({ sort_order: i } as never)
                    .eq("id", item.id)
            )
        );
    };

    return (
        <>
            {/* Botón añadir */}
            <div className="flex justify-end mb-6">
                <Button variant="primary" size="md" onClick={openCreate}>
                    <Plus size={18} />
                    Añadir imagen
                </Button>
            </div>

            {/* Grid galería */}
            {items.length === 0 ? (
                <div className="card p-16 text-center">
                    <ImageIcon
                        size={40}
                        className="text-[var(--color-outline)] mx-auto mb-3"
                    />
                    <p className="text-sm text-[var(--color-on-surface-variant)]">
                        No hay imágenes en la galería aún
                    </p>
                    <Button
                        variant="outline"
                        size="md"
                        className="mt-4"
                        onClick={openCreate}
                    >
                        Añadir primera imagen
                    </Button>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={items.map((i) => i.id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {items.map((item) => (
                                <SortableGalleryCard
                                    key={item.id}
                                    item={item}
                                    onEdit={openEdit}
                                    onDelete={setDeleteModal}
                                    onToggle={handleToggle}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {/* ── Modal formulario ────────────────────────────────── */}
            <Modal
                open={formModal}
                onClose={() => setFormModal(false)}
                title={editing ? "Editar imagen" : "Añadir imagen"}
                size="md"
            >
                <div className="space-y-4">
                    <ImageUploader
                        images={images}
                        onChange={setImages}
                        folder="gallery"
                        maxImages={1}
                    />
                    <Input
                        label="Título"
                        value={form.title}
                        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                        placeholder="Opcional"
                    />
                    <Input
                        label="Subtítulo"
                        value={form.subtitle}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, subtitle: e.target.value }))
                        }
                        placeholder="Opcional"
                    />
                    <Toggle
                        checked={form.active}
                        onChange={(v) => setForm((p) => ({ ...p, active: v }))}
                        label="Imagen activa"
                        description="Visible en el carrusel del inicio"
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
                            {editing ? "Guardar cambios" : "Añadir imagen"}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* ── Modal eliminar ───────────────────────────────────── */}
            <Modal
                open={!!deleteModal}
                onClose={() => setDeleteModal(null)}
                title="Eliminar imagen"
                size="sm"
            >
                <p className="text-sm text-[var(--color-on-surface-variant)] mb-6">
                    ¿Estás seguro de que quieres eliminar esta imagen de la galería?
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