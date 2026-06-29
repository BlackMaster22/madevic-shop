"use client";

import { useState } from "react";
import {
    UserPlus,
    Shield,
    User,
    ToggleLeft,
    ToggleRight,
    Mail,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import type { Profile } from "@/types/database";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
    initialOperadores: Profile[];
    currentUserId: string;
}

export default function OperadoresClient({
    initialOperadores,
    currentUserId,
}: Props) {
    const [operadores, setOperadores] = useState<Profile[]>(initialOperadores);
    const [createModal, setCreateModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        full_name: "",
        email: "",
    });

    const supabase = createClient();

    // ── Crear operador ──────────────────────────────────────────
    const handleCreate = async () => {
        if (!form.full_name.trim() || !form.email.trim()) {
            toast.error("Nombre y email son obligatorios");
            return;
        }

        setSaving(true);

        // Invitar usuario por email — Supabase enviará el email de invitación
        const res = await fetch("/api/admin/operadores", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                full_name: form.full_name.trim(),
                email: form.email.trim(),
            }),
        });

        const data = await res.json() as { error?: string; profile?: Profile };

        if (!res.ok || data.error) {
            toast.error(data.error ?? "Error al crear el operador");
        } else {
            if (data.profile) {
                setOperadores((prev) => [...prev, data.profile!]);
            }
            toast.success(`Invitación enviada a ${form.email}`);
            setCreateModal(false);
            setForm({ full_name: "", email: "" });
        }

        setSaving(false);
    };

    // ── Toggle activo ───────────────────────────────────────────
    const handleToggleActive = async (operador: Profile) => {
        if (operador.id === currentUserId) {
            toast.error("No puedes desactivar tu propia cuenta");
            return;
        }

        const { error } = await supabase
            .from("profiles")
            .update({ active: !operador.active } as never)
            .eq("id", operador.id);

        if (error) {
            toast.error("Error al actualizar el operador");
            return;
        }

        setOperadores((prev) =>
            prev.map((o) =>
                o.id === operador.id ? { ...o, active: !o.active } : o
            )
        );
        toast.success(
            operador.active ? "Operador desactivado" : "Operador activado"
        );
    };

    return (
        <>
            {/* Botón crear */}
            <div className="flex justify-end mb-6">
                <Button
                    variant="primary"
                    size="md"
                    onClick={() => setCreateModal(true)}
                >
                    <UserPlus size={18} />
                    Invitar operador
                </Button>
            </div>

            {/* Lista */}
            <div className="card overflow-hidden">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Operador</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Creado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {operadores.map((op) => (
                            <tr key={op.id}>
                                {/* Info */}
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-[var(--color-primary-fixed)] flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-bold text-[var(--color-primary)]">
                                                {op.full_name?.charAt(0).toUpperCase() ?? "?"}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-[var(--color-on-surface)]">
                                                {op.full_name ?? "Sin nombre"}
                                                {op.id === currentUserId && (
                                                    <span className="ml-2 text-xs text-[var(--color-on-surface-variant)]">
                                                        (tú)
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs text-[var(--color-on-surface-variant)] flex items-center gap-1">
                                                <Mail size={11} />
                                                {op.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* Rol */}
                                <td>
                                    <div className="flex items-center gap-1.5">
                                        {op.role === "admin_principal" ? (
                                            <Shield
                                                size={14}
                                                className="text-[var(--color-secondary)]"
                                            />
                                        ) : (
                                            <User
                                                size={14}
                                                className="text-[var(--color-on-surface-variant)]"
                                            />
                                        )}
                                        <span className="text-sm text-[var(--color-on-surface)]">
                                            {op.role === "admin_principal"
                                                ? "Administrador"
                                                : "Operador"}
                                        </span>
                                    </div>
                                </td>

                                {/* Estado */}
                                <td>
                                    <Badge variant={op.active ? "success" : "default"}>
                                        {op.active ? "Activo" : "Inactivo"}
                                    </Badge>
                                </td>

                                {/* Fecha */}
                                <td className="text-sm text-[var(--color-on-surface-variant)]">
                                    {format(new Date(op.created_at), "d MMM yyyy", {
                                        locale: es,
                                    })}
                                </td>

                                {/* Acciones */}
                                <td>
                                    {op.role !== "admin_principal" && (
                                        <button
                                            onClick={() => handleToggleActive(op)}
                                            className="flex items-center gap-1.5 text-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors"
                                            title={op.active ? "Desactivar" : "Activar"}
                                        >
                                            {op.active ? (
                                                <ToggleRight
                                                    size={20}
                                                    className="text-[var(--color-secondary)]"
                                                />
                                            ) : (
                                                <ToggleLeft size={20} />
                                            )}
                                            {op.active ? "Desactivar" : "Activar"}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Modal crear operador ─────────────────────────────── */}
            <Modal
                open={createModal}
                onClose={() => setCreateModal(false)}
                title="Invitar operador"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-sm text-[var(--color-on-surface-variant)]">
                        El operador recibirá un email para crear su contraseña y acceder
                        al panel.
                    </p>
                    <Input
                        label="Nombre completo"
                        value={form.full_name}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, full_name: e.target.value }))
                        }
                        placeholder="Nombre del operador"
                        autoFocus
                    />
                    <Input
                        label="Correo electrónico"
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, email: e.target.value }))
                        }
                        placeholder="operador@madevic.cu"
                    />
                    <div className="flex gap-3 justify-end pt-2">
                        <Button
                            variant="ghost"
                            size="md"
                            onClick={() => setCreateModal(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="primary"
                            size="md"
                            loading={saving}
                            onClick={handleCreate}
                        >
                            <Mail size={16} />
                            Enviar invitación
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}