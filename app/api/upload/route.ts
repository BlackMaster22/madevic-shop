import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadImage, deleteImage } from "@/lib/r2/upload";

export async function POST(request: NextRequest) {
    try {
        // Verificar autenticación y rol
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        const allowed =
            (profile as unknown as { role: string })?.role === "admin_principal" ||
            (profile as unknown as { role: string })?.role === "operador";

        if (!allowed) {
            return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
        }

        // Procesar el archivo
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const folder = (formData.get("folder") as string) || "products";

        if (!file) {
            return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });
        }

        // Validar tipo y tamaño
        const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: "Tipo de archivo no permitido. Usa JPG, PNG o WebP" },
                { status: 400 }
            );
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: "El archivo supera el límite de 5MB" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const url = await uploadImage(buffer, file.name, file.type, folder);

        return NextResponse.json({ url });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Error al subir la imagen" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { url } = await request.json() as { url: string };
        if (!url) {
            return NextResponse.json({ error: "URL requerida" }, { status: 400 });
        }

        await deleteImage(url);
        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json(
            { error: "Error al eliminar la imagen" },
            { status: 500 }
        );
    }
}