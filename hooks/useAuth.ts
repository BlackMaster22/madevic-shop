"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import type { Profile } from "@/types/database";

export function useAuth() {
    const { profile, isLoading, setProfile, setLoading, clearAuth } =
        useAuthStore();

    const supabase = createClient();

    useEffect(() => {
        // Obtener sesión inicial
        const getSession = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                clearAuth();
                return;
            }

            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            setProfile(data as Profile | null);
        };

        getSession();

        // Escuchar cambios de sesión
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === "SIGNED_OUT" || !session) {
                    clearAuth();
                    return;
                }

                if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
                    const { data } = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("id", session.user.id)
                        .single();

                    setProfile(data as Profile | null);
                }
            }
        );

        return () => subscription.unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { profile, isLoading };
}