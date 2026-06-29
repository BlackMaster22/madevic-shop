"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import {
    SortableContext,
    rectSortingStrategy,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Upload, ImageIcon, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import toast from "react-hot-toast";

interface Props {
    images: string[];
    onChange: (images: string[]) => void;
    folder?: string;
    maxImages?: number;
}

// ── Thumbnail sortable ────────────────────────────────────────
function SortableImage({
    url,
    index,
    onRemove,
}: {
    url: string;
    index: number;
    onRemove: (url: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: url });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={clsx(
                "relative group rounded-xl overflow-hidden bg-[var(--color-surface-container)] aspect-square border-2 border-[var(--color-outline-variant)]",
                isDragging && "opacity-50 border-[var(--color-secondary)]",
                index === 0 && "border-[var(--color-secondary)]"
            )}
        >
            <Image
                src={url}
                alt={`Imagen ${index + 1}`}
                fill
                className="object-cover"
                sizes="150px"
            />

            {/* Badge principal */}
            {index === 0 && (
                <span className="absolute top-1.5 left-1.5 text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-secondary)] text-white font-medium">
                    Principal
                </span>
            )}

            {/* Controles */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {/* Handle drag */}
                <button
                    {...attributes}
                    {...listeners}
                    className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/40 flex items-center justify-center text-white cursor-grab"
                    aria-label="Reordenar"
                >
                    <GripVertical size={16} />
                </button>

                {/* Eliminar */}
                <button
                    onClick={() => onRemove(url)}
                    className="w-8 h-8 rounded-lg bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white"
                    aria-label="Eliminar imagen"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}

// ── Componente principal ──────────────────────────────────────
export default function ImageUploader({
    images,
    onChange,
    folder = "products",
    maxImages = 10,
}: Props) {
    const [uploading, setUploading] = useState(false);

    const uploadFile = async (file: File): Promise<string | null> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            const { error } = await res.json() as { error: string };
            throw new Error(error ?? "Error al subir imagen");
        }

        const { url } = await res.json() as { url: string };
        return url;
    };

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            const remaining = maxImages - images.length;
            if (remaining <= 0) {
                toast.error(`Máximo ${maxImages} imágenes`);
                return;
            }

            const filesToUpload = acceptedFiles.slice(0, remaining);
            setUploading(true);

            const results = await Promise.allSettled(
                filesToUpload.map((f) => uploadFile(f))
            );

            const newUrls: string[] = [];
            let errors = 0;

            results.forEach((result) => {
                if (result.status === "fulfilled" && result.value) {
                    newUrls.push(result.value);
                } else {
                    errors++;
                }
            });

            if (newUrls.length > 0) {
                onChange([...images, ...newUrls]);
                toast.success(
                    `${newUrls.length} imagen${newUrls.length > 1 ? "es" : ""} subida${newUrls.length > 1 ? "s" : ""}`
                );
            }

            if (errors > 0) {
                toast.error(`${errors} imagen${errors > 1 ? "es" : ""} no se pudo subir`);
            }

            setUploading(false);
        },
        [images, maxImages, onChange]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
        disabled: uploading || images.length >= maxImages,
        multiple: true,
    });

    const handleRemove = async (url: string) => {
        // Eliminar de R2
        await fetch("/api/upload", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
        });
        onChange(images.filter((img) => img !== url));
        toast.success("Imagen eliminada");
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = images.indexOf(active.id as string);
        const newIndex = images.indexOf(over.id as string);
        onChange(arrayMove(images, oldIndex, newIndex));
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="label mb-0">
                    Imágenes{" "}
                    <span className="text-[var(--color-on-surface-variant)] font-normal">
                        (opcional — máx. {maxImages})
                    </span>
                </label>
                <span className="text-xs text-[var(--color-on-surface-variant)]">
                    {images.length}/{maxImages}
                </span>
            </div>

            {/* Grid de imágenes */}
            {images.length > 0 && (
                <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={images} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {images.map((url, i) => (
                                <SortableImage
                                    key={url}
                                    url={url}
                                    index={i}
                                    onRemove={handleRemove}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {/* Zona de drop */}
            {images.length < maxImages && (
                <div
                    {...getRootProps()}
                    className={clsx(
                        "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
                        isDragActive
                            ? "border-[var(--color-secondary)] bg-[var(--color-secondary-fixed)] scale-[1.01]"
                            : "border-[var(--color-outline-variant)] hover:border-[var(--color-secondary)] hover:bg-[var(--color-surface-container)]",
                        (uploading || images.length >= maxImages) &&
                        "opacity-50 cursor-not-allowed"
                    )}
                >
                    <input {...getInputProps()} />

                    {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2
                                size={32}
                                className="text-[var(--color-secondary)] animate-spin"
                            />
                            <p className="text-sm text-[var(--color-on-surface-variant)]">
                                Subiendo imágenes...
                            </p>
                        </div>
                    ) : isDragActive ? (
                        <div className="flex flex-col items-center gap-2">
                            <Upload size={32} className="text-[var(--color-secondary)]" />
                            <p className="text-sm font-medium text-[var(--color-secondary)]">
                                Suelta las imágenes aquí
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <ImageIcon
                                size={32}
                                className="text-[var(--color-outline-variant)]"
                            />
                            <div>
                                <p className="text-sm font-medium text-[var(--color-on-surface)]">
                                    Arrastra imágenes aquí
                                </p>
                                <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">
                                    o haz click para seleccionar archivos
                                </p>
                            </div>
                            <p className="text-xs text-[var(--color-on-surface-variant)]">
                                JPG, PNG, WebP — máx. 5MB por imagen
                            </p>
                        </div>
                    )}
                </div>
            )}

            {images.length > 0 && (
                <p className="text-xs text-[var(--color-on-surface-variant)]">
                    💡 Arrastra las imágenes para reordenarlas. La primera será la imagen principal.
                </p>
            )}
        </div>
    );
}