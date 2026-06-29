"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") ?? "/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const supabase = createClient();

    const validate = () => {
        const errs: typeof errors = {};
        if (!email) errs.email = "El email es obligatorio";
        if (!password) errs.password = "La contraseña es obligatoria";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            toast.error(
                error.message === "Invalid login credentials"
                    ? "Email o contraseña incorrectos"
                    : "Error al iniciar sesión. Intenta de nuevo."
            );
            setLoading(false);
            return;
        }

        toast.success("¡Bienvenido de vuelta!");
        router.push(redirect);
        router.refresh();
    };

    return (
        <div className="w-full max-w-md">
            <div className="card p-8">
                {/* Encabezado */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-display font-bold text-[var(--color-primary)]">
                        Iniciar sesión
                    </h1>
                    <p className="text-sm text-[var(--color-on-surface-variant)] mt-2">
                        Accede a tu cuenta MADEVIC
                    </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Correo electrónico"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={errors.email}
                        placeholder="tu@email.com"
                        autoComplete="email"
                        autoFocus
                    />

                    <div>
                        <Input
                            label="Contraseña"
                            type={showPass ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={errors.password}
                            placeholder="••••••••"
                            autoComplete="current-password"
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
                        <div className="flex justify-end mt-1.5">
                            <Link
                                href="/recuperar-contrasena"
                                className="text-xs text-[var(--color-secondary)] hover:underline"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={loading}
                    >
                        <LogIn size={18} />
                        Iniciar sesión
                    </Button>
                </form>

                {/* Registro */}
                <p className="text-center text-sm text-[var(--color-on-surface-variant)] mt-6">
                    ¿No tienes cuenta?{" "}
                    <Link
                        href="/register"
                        className="font-medium text-[var(--color-secondary)] hover:underline"
                    >
                        Crear cuenta gratis
                    </Link>
                </p>
            </div>
        </div>
    );
}