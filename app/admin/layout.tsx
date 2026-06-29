import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/Sidebar";
import type { Profile } from "@/types/database";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profileRaw } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    const profile = profileRaw as unknown as Profile;

    const allowed =
        profile?.role === "admin_principal" || profile?.role === "operador";

    if (!allowed) redirect("/");

    return (
        <div className="flex h-screen bg-[var(--color-surface-container-low)] overflow-hidden">
            <AdminSidebar profile={profile} />
            <main className="flex-1 overflow-y-auto">
                <div className="p-8 max-w-[1400px]">
                    {children}
                </div>
            </main>
        </div>
    );
}