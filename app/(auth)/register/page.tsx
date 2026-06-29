"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";

interface FormData {
    full_name: string;
    email: string;
    phone: string;
    password: string;
    confirm: string;
}

interface FormErrors {
    full_name?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirm?: string;
}

export default function RegisterPage() {
    const router = useRouter();

    const [form, setForm] = useState<FormData>({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        confirm: "",
    });
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const supabase = createClient();

    const update = (field: keyof FormData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const validate = (): boolean => {
        const errs: FormErrors = {};

        if (!form.full_name.trim())
            errs.full_name = "El nombre es obligatorio";

        if (!form.email)
            errs.email = "El email es obligatorio";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            errs.email = "Email no válido";

        if (form.password.length < 8)
            errs.password = "Mínimo 8 caracteres";

        if (form.password !== form.confirm)
            errs.confirm = "Las contraseñas no coinciden";

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);

        const { error } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
                data: {
                    full_name: form.full_name.trim(),
                    phone: form.phone,
                },
                emailRedirectTo: `${window.location.origin}/`,
            },
        });

        if (error) {
            toast.error(
                error.message.includes("already registered")
                    ? "Este email ya está registrado"
                    : "Error al crear la cuenta. Intenta de nuevo."
            );
            setLoading(false);
            return;
        }

        toast.success("¡Cuenta creada! Revisa tu email para confirmarla.");
        router.push("/login");
    };

    return (
        <div className="w-full max-w-md">
            <div className="card p-8">
                {/* Encabezado */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-display font-bold text-[var(--color-primary)]">
                        Crear cuenta
                    </h1>
                    <p className="text-sm text-[var(--color-on-surface-variant)] mt-2">
                        Únete a MADEVIC y empieza a pedir
                    </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nombre completo"
                        type="text"
                        value={form.full_name}
                        onChange={update("full_name")}
                        error={errors.full_name}
                        placeholder="Tu nombre"
                        autoComplete="name"
                        autoFocus
                    />

                    <Input
                        label="Correo electrónico"
                        type="email"
                        value={form.email}
                        onChange={update("email")}
                        error={errors.email}
                        placeholder="tu@email.com"
                        autoComplete="email"
                    />

                    <Input
                        label="Teléfono (opcional)"
                        type="tel"
                        value={form.phone}
                        onChange={update("phone")}
                        error={errors.phone}
                        placeholder="+53 5 000 0000"
                        autoComplete="tel"
                    />

                    <Input
                        label="Contraseña"
                        type={showPass ? "text" : "password"}
                        value={form.password}
                        onChange={update("password")}
                        error={errors.password}
                        placeholder="Mínimo 8 caracteres"
                        autoComplete="new-password"
                        hint="Mínimo 8 caracteres"
                        icon={
                            <button
                                type="button"
                                onClick={() => setShowPass((v) => !v)}
                                className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
                                tabIndex={-1}
                            >
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        }
                    />

                    <Input
                        label="Confirmar contraseña"
                        type={showConfirm ? "text" : "password"}
                        value={form.confirm}
                        onChange={update("confirm")}
                        error={errors.confirm}
                        placeholder="Repite la contraseña"
                        autoComplete="new-password"
                        icon={
                            <button
                                type="button"
                                onClick={() => setShowConfirm((v) => !v)}
                                className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
                                tabIndex={-1}
                            >
                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        }
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={loading}
                        className="mt-2"
                    >
                        <UserPlus size={18} />
                        Crear cuenta
                    </Button>
                </form>

                {/* Login */}
                <p className="text-center text-sm text-[var(--color-on-surface-variant)] mt-6">
                    ¿Ya tienes cuenta?{" "}
                    <Link
                        href="/login"
                        className="font-medium text-[var(--color-secondary)] hover:underline"
                    >
                        Iniciar sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}