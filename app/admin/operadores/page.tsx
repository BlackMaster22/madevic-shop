import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OperadoresClient from "@/components/admin/OperadoresClient";
import type { Profile } from "@/types/database";

export const metadata = { title: "Operadores" };

export default async function OperadoresPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Solo admin_principal puede ver esta página
    const { data: profileRaw } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const profile = profileRaw as unknown as { role: string };
    if (profile?.role !== "admin_principal") redirect("/admin/dashboard");

    const { data: operadoresRaw } = await supabase
        .from("profiles")
        .select("*")
        .in("role", ["admin_principal", "operador"])
        .order("created_at");

    const operadores = (operadoresRaw ?? []) as unknown as Profile[];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-[var(--color-primary)]">
                    Operadores
                </h1>
                <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
                    Gestiona los usuarios con acceso al panel admin
                </p>
            </div>
            <OperadoresClient
                initialOperadores={operadores}
                currentUserId={user.id}
            />
        </div>
    );
}