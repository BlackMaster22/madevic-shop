import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogClient from "@/components/admin/LogClient";
import type { OrderStatus, Profile } from "@/types/database";

export const metadata = { title: "Log de actividad" };

// Tipo independiente — no extiende OrderStatusLog
export interface LogEntry {
    id: string;
    order_id: string;
    changed_by: string | null;
    old_status: OrderStatus | null;
    new_status: OrderStatus;
    note: string | null;
    notified_email: boolean;
    notified_telegram: boolean;
    created_at: string;
    profile: Pick<Profile, "full_name" | "email" | "role"> | null;
    order: { order_number: string } | null;
}

export default async function LogPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profileRaw } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const profile = profileRaw as unknown as { role: string };
    if (profile?.role !== "admin_principal") redirect("/admin/dashboard");

    const { data: logRaw } = await supabase
        .from("order_status_log")
        .select(`
      *,
      profile:profiles(full_name, email, role),
      order:orders(order_number)
    `)
        .order("created_at", { ascending: false })
        .limit(200);

    const entries = (logRaw ?? []) as unknown as LogEntry[];

    const { data: operadoresRaw } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("role", ["admin_principal", "operador"]);

    const operadores = (operadoresRaw ?? []) as unknown as Pick<Profile, "id" | "full_name" | "email">[];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-[var(--color-primary)]">
                    Log de actividad
                </h1>
                <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
                    Registro de todos los cambios de estado de pedidos
                </p>
            </div>
            <LogClient entries={entries} operadores={operadores} />
        </div>
    );
}