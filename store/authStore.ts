import { create } from "zustand";
import type { Profile } from "@/types/database";

interface AuthStore {
    profile: Profile | null;
    isLoading: boolean;

    setProfile: (profile: Profile | null) => void;
    setLoading: (loading: boolean) => void;
    clearAuth: () => void;

    // Computed
    isAuthenticated: () => boolean;
    isAdmin: () => boolean;
    isOperator: () => boolean;
    isAdminOrOperator: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    profile: null,
    isLoading: true,

    setProfile: (profile) => set({ profile, isLoading: false }),
    setLoading: (isLoading) => set({ isLoading }),
    clearAuth: () => set({ profile: null, isLoading: false }),

    isAuthenticated: () => get().profile !== null,
    isAdmin: () => get().profile?.role === "admin_principal",
    isOperator: () => get().profile?.role === "operador",
    isAdminOrOperator: () =>
        get().profile?.role === "admin_principal" ||
        get().profile?.role === "operador",
}));