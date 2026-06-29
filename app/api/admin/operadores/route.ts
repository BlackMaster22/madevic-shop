import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
    try {
        // Verificar que el usuario es admin_principal
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { data: profileRaw } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        const profile = profileRaw as unknown as { role: string };

        if (profile?.role !== "admin_principal") {
            return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
        }

        const { full_name, email } = await request.json() as {
            full_name: string;
            email: string;
        };

        if (!full_name || !email) {
            return NextResponse.json(
                { error: "Nombre y email son obligatorios" },
                { status: 400 }
            );
        }

        // Usar admin client para crear el usuario
        const adminClient = createAdminClient();

        const { data: newUser, error: createError } =
            await adminClient.auth.admin.inviteUserByEmail(email, {
                data: {
                    full_name,
                    role: "operador",
                },
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
            });

        if (createError) {
            return NextResponse.json(
                {
                    error: createError.message.includes("already registered")
                        ? "Este email ya está registrado"
                        : "Error al crear el operador",
                },
                { status: 400 }
            );
        }

        // Actualizar el rol en profiles (el trigger habrá creado el perfil)
        if (newUser.user) {
            await adminClient
                .from("profiles")
                .update({ role: "operador", full_name } as never)
                .eq("id", newUser.user.id);

            const { data: newProfile } = await adminClient
                .from("profiles")
                .select("*")
                .eq("id", newUser.user.id)
                .single();

            return NextResponse.json({ profile: newProfile });
        }

        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error("Create operator error:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}