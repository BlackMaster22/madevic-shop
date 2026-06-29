import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// ⚠️ Este cliente bypasea RLS — NUNCA usar en el cliente
// Solo para: crear operadores, triggers, operaciones del sistema
export function createAdminClient() {
    return createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
}