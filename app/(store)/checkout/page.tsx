import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CheckoutClient from "@/components/store/CheckoutClient";
import type { Profile } from "@/types/database";

export const metadata = { title: "Confirmar pedido" };

export default async function CheckoutPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login?redirect=/checkout");

    const { data: profileRaw } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    const profile = profileRaw as unknown as Profile;

    return (
        <div className="section">
            <div className="container-madevic max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold text-[var(--color-primary)]">
                        Confirmar pedido
                    </h1>
                    <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
                        Revisa tu pedido antes de enviarlo
                    </p>
                </div>
                <CheckoutClient profile={profile} />
            </div>
        </div>
    );
}