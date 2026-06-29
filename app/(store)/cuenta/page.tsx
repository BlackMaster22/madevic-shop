"use client";

import { useState, useEffect } from "react";
import { User, Phone, MapPin, Mail, Lock, Send, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";
import type { Profile } from "@/types/database";

export default function AccountPage() {
    useAuth();
    const { profile, setProfile } = useAuthStore();
    const supabase = createClient();

    const [form, setForm] = useState({
        full_name: "",
        phone: "",
        address: "",
    });
    const [emailForm, setEmailForm] = useState({ email: "" });
    const [passForm, setPassForm] = useState({ current: "", next: "", confirm: "" });
    const [telegramCode, setTelegramCode] = useState<string | null>(null);

    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingEmail, setLoadingEmail] = useState(false);
    const [loadingPass, setLoadingPass] = useState(false);
    const [loadingTelegram, setLoadingTelegram] = useState(false);

    useEffect(() => {
        if (profile) {
            setForm({
                full_name: profile.full_name ?? "",
                phone: profile.phone ?? "",
                address: profile.address ?? "",
            });
            setEmailForm({ email: profile.email });
        }
    }, [profile]);

    // ── Guardar perfil ──────────────────────────────────────────
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        setLoadingProfile(true);

        const { data, error } = await supabase
            .from("profiles")
            .update({
                full_name: form.full_name,
                phone: form.phone,
                address: form.address,
            } as never)
            .eq("id", profile.id)
            .select()
            .single();

        if (error) {
            toast.error("Error al guardar el perfil");
        } else {
            setProfile(data as unknown as Profile);
            toast.success("Perfil actualizado");
        }
        setLoadingProfile(false);
    };

    // ── Cambiar email ───────────────────────────────────────────
    const handleChangeEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingEmail(true);

        const { error } = await supabase.auth.updateUser({
            email: emailForm.email,
        });

        if (error) {
            toast.error("Error al actualizar el email");
        } else {
            toast.success("Revisa tu nuevo email para confirmar el cambio");
        }
        setLoadingEmail(false);
    };

    // ── Cambiar contraseña ──────────────────────────────────────
    const handleChangePass = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passForm.next.length < 8) {
            toast.error("La contraseña debe tener al menos 8 caracteres");
            return;
        }
        if (passForm.next !== passForm.confirm) {
            toast.error("Las contraseñas no coinciden");
            return;
        }

        setLoadingPass(true);
        const { error } = await supabase.auth.updateUser({
            password: passForm.next,
        });

        if (error) {
            toast.error("Error al cambiar la contraseña");
        } else {
            toast.success("Contraseña actualizada");
            setPassForm({ current: "", next: "", confirm: "" });
        }
        setLoadingPass(false);
    };

    // ── Generar código Telegram ─────────────────────────────────
    const handleGenerateTelegramCode = async () => {
        if (!profile) return;
        setLoadingTelegram(true);

        // Generar código aleatorio de 6 dígitos
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        const { error } = await supabase
            .from("profiles")
            .update({ telegram_code: code } as never)
            .eq("id", profile.id);

        if (error) {
            toast.error("Error al generar el código");
        } else {
            setTelegramCode(code);
        }
        setLoadingTelegram(false);
    };

    if (!profile) {
        return (
            <div className="section">
                <div className="container-madevic max-w-2xl">
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton h-40 w-full rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="section">
            <div className="container-madevic max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold text-[var(--color-primary)]">
                        Mi cuenta
                    </h1>
                    <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
                        Gestiona tu información personal
                    </p>
                </div>

                <div className="space-y-6">

                    {/* ── Datos personales ──────────────────────────── */}
                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-primary-fixed)] flex items-center justify-center">
                                <User size={20} className="text-[var(--color-primary)]" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-[var(--color-on-surface)]">
                                    Datos personales
                                </h2>
                                <p className="text-xs text-[var(--color-on-surface-variant)]">
                                    Tu nombre, teléfono y dirección
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            <Input
                                label="Nombre completo"
                                value={form.full_name}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, full_name: e.target.value }))
                                }
                                icon={<User size={16} />}
                                placeholder="Tu nombre completo"
                            />
                            <Input
                                label="Teléfono"
                                value={form.phone}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, phone: e.target.value }))
                                }
                                icon={<Phone size={16} />}
                                placeholder="+53 5 000 0000"
                            />
                            <Input
                                label="Dirección"
                                value={form.address}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, address: e.target.value }))
                                }
                                icon={<MapPin size={16} />}
                                placeholder="Tu dirección de entrega"
                            />
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="md"
                                    loading={loadingProfile}
                                >
                                    <Save size={16} />
                                    Guardar cambios
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* ── Email ─────────────────────────────────────── */}
                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-primary-fixed)] flex items-center justify-center">
                                <Mail size={20} className="text-[var(--color-primary)]" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-[var(--color-on-surface)]">
                                    Correo electrónico
                                </h2>
                                <p className="text-xs text-[var(--color-on-surface-variant)]">
                                    Se enviará un email de confirmación al nuevo correo
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleChangeEmail} className="space-y-4">
                            <Input
                                label="Email actual"
                                type="email"
                                value={emailForm.email}
                                onChange={(e) =>
                                    setEmailForm({ email: e.target.value })
                                }
                                icon={<Mail size={16} />}
                            />
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    size="md"
                                    loading={loadingEmail}
                                >
                                    Actualizar email
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* ── Contraseña ────────────────────────────────── */}
                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-primary-fixed)] flex items-center justify-center">
                                <Lock size={20} className="text-[var(--color-primary)]" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-[var(--color-on-surface)]">
                                    Contraseña
                                </h2>
                                <p className="text-xs text-[var(--color-on-surface-variant)]">
                                    Mínimo 8 caracteres
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleChangePass} className="space-y-4">
                            <Input
                                label="Nueva contraseña"
                                type="password"
                                value={passForm.next}
                                onChange={(e) =>
                                    setPassForm((p) => ({ ...p, next: e.target.value }))
                                }
                                placeholder="••••••••"
                            />
                            <Input
                                label="Confirmar nueva contraseña"
                                type="password"
                                value={passForm.confirm}
                                onChange={(e) =>
                                    setPassForm((p) => ({ ...p, confirm: e.target.value }))
                                }
                                placeholder="••••••••"
                            />
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    size="md"
                                    loading={loadingPass}
                                >
                                    Cambiar contraseña
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* ── Telegram ──────────────────────────────────── */}
                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-primary-fixed)] flex items-center justify-center">
                                <Send size={20} className="text-[var(--color-primary)]" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-[var(--color-on-surface)]">
                                    Notificaciones por Telegram
                                </h2>
                                <p className="text-xs text-[var(--color-on-surface-variant)]">
                                    Recibe actualizaciones de tus pedidos en Telegram
                                </p>
                            </div>
                        </div>

                        {profile.telegram_chat_id ? (
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-status-listo)] border border-[var(--color-status-listo-border)]">
                                <span className="text-[var(--color-status-listo-text)] text-sm font-medium">
                                    ✓ Telegram vinculado correctamente
                                </span>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-[var(--color-on-surface-variant)]">
                                    Vincula tu cuenta de Telegram para recibir notificaciones
                                    automáticas cuando cambie el estado de tus pedidos.
                                </p>

                                {telegramCode ? (
                                    <div className="space-y-3">
                                        <div className="p-4 rounded-xl bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]">
                                            <p className="text-xs text-[var(--color-on-surface-variant)] mb-2">
                                                Tu código de vinculación:
                                            </p>
                                            <p className="text-3xl font-mono font-bold tracking-widest text-[var(--color-primary)] text-center">
                                                {telegramCode}
                                            </p>
                                        </div>
                                        <ol className="text-sm text-[var(--color-on-surface-variant)] space-y-1 list-decimal list-inside">
                                            <li>
                                                Abre Telegram y busca{" "}
                                                <strong className="text-[var(--color-on-surface)]">
                                                    @MadevicBot
                                                </strong>
                                            </li>
                                            <li>
                                                Envía el mensaje:{" "}
                                                <code className="bg-[var(--color-surface-container)] px-1.5 py-0.5 rounded text-xs font-mono">
                                                    /vincular {telegramCode}
                                                </code>
                                            </li>
                                            <li>El bot confirmará la vinculación automáticamente</li>
                                        </ol>
                                    </div>
                                ) : (
                                    <Button
                                        variant="secondary"
                                        size="md"
                                        loading={loadingTelegram}
                                        onClick={handleGenerateTelegramCode}
                                    >
                                        <Send size={16} />
                                        Generar código de vinculación
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}