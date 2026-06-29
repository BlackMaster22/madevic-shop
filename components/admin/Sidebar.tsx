"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    FolderOpen,
    ClipboardList,
    Users,
    ScrollText,
    ImageIcon,
    LogOut,
    ChevronRight,
} from "lucide-react";
import { clsx } from "clsx";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import toast from "react-hot-toast";

interface Props {
    profile: Profile;
}

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
    adminOnly: boolean;
}

const NAV_ITEMS: NavItem[] = [
    {
        href: "/admin/dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard size={18} />,
        adminOnly: false,
    },
    {
        href: "/admin/pedidos",
        label: "Pedidos",
        icon: <ClipboardList size={18} />,
        adminOnly: false,
    },
    {
        href: "/admin/productos",
        label: "Productos",
        icon: <Package size={18} />,
        adminOnly: false,
    },
    {
        href: "/admin/categorias",
        label: "Categorías",
        icon: <FolderOpen size={18} />,
        adminOnly: false,
    },
    {
        href: "/admin/galeria",
        label: "Galería destacada",
        icon: <ImageIcon size={18} />,
        adminOnly: false,
    },
    {
        href: "/admin/operadores",
        label: "Operadores",
        icon: <Users size={18} />,
        adminOnly: true,
    },
    {
        href: "/admin/log",
        label: "Log de actividad",
        icon: <ScrollText size={18} />,
        adminOnly: true,
    },
];

export default function AdminSidebar({ profile }: Props) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const isAdmin = profile.role === "admin_principal";

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        toast.success("Sesión cerrada");
        router.push("/");
    };

    const visibleItems = NAV_ITEMS.filter(
        (item) => !item.adminOnly || isAdmin
    );

    return (
        <aside className="w-64 flex-shrink-0 h-full bg-[var(--color-surface-bright)] border-r border-[var(--color-outline-variant)] flex flex-col shadow-[var(--shadow-admin)]">

            {/* Logo */}
            <div className="px-6 py-5 border-b border-[var(--color-outline-variant)]">
                <Link href="/" className="block">
                    <span className="font-display text-lg font-bold text-[var(--color-primary)]">
                        MADEVIC
                    </span>
                    <span className="block text-xs text-[var(--color-on-surface-variant)] mt-0.5">
                        Panel de administración
                    </span>
                </Link>
            </div>

            {/* Navegación */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {visibleItems.map((item) => {
                    const active = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                                active
                                    ? "bg-[var(--color-primary-fixed)] text-[var(--color-primary)]"
                                    : "text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] hover:text-[var(--color-on-surface)]"
                            )}
                        >
                            <span className={clsx(
                                active
                                    ? "text-[var(--color-primary)]"
                                    : "text-[var(--color-outline)] group-hover:text-[var(--color-on-surface)]"
                            )}>
                                {item.icon}
                            </span>
                            {item.label}
                            {active && (
                                <ChevronRight size={14} className="ml-auto text-[var(--color-primary)]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Usuario y cerrar sesión */}
            <div className="px-3 py-4 border-t border-[var(--color-outline-variant)]">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary-fixed)] flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-[var(--color-primary)]">
                            {profile.full_name?.charAt(0).toUpperCase() ?? "A"}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--color-on-surface)] truncate">
                            {profile.full_name ?? "Usuario"}
                        </p>
                        <p className="text-xs text-[var(--color-on-surface-variant)] truncate">
                            {profile.role === "admin_principal" ? "Administrador" : "Operador"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-error-container)] transition-colors"
                >
                    <LogOut size={18} />
                    Cerrar sesión
                </button>
            </div>
        </aside>
    );
}