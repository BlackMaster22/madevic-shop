"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ShoppingCart,
    Heart,
    User,
    Menu,
    X,
    Search,
    LogOut,
    Settings,
    Package,
} from "lucide-react";
import { clsx } from "clsx";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/hooks/useAuth";
import CartDrawer from "@/components/store/CartDrawer";
import toast from "react-hot-toast";

export default function Navbar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Inicializar auth
    useAuth();

    const { profile } = useAuthStore();
    const totalItems = useCartStore((s) => s.totalItems());
    const toggleCart = useCartStore((s) => s.toggleCart);
    const supabase = createClient();

    // Sombra al hacer scroll
    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", handler);
        return () => window.removeEventListener("scroll", handler);
    }, []);

    // Cerrar menú móvil al cambiar de ruta
    useEffect(() => {
        setMobileOpen(false);
        setUserMenuOpen(false);
    }, [pathname]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        toast.success("Sesión cerrada");
        window.location.href = "/";
    };

    const navLinks = [
        { href: "/", label: "Inicio" },
        { href: "/catalogo", label: "Catálogo" },
    ];

    return (
        <>
            <header
                className={clsx(
                    "sticky top-0 z-30 bg-[var(--color-surface-bright)] transition-shadow duration-300",
                    scrolled && "shadow-[var(--shadow-organic)]"
                )}
            >
                <div className="container-madevic">
                    <div className="flex items-center justify-between h-16 md:h-18">

                        {/* ── Logo ───────────────────────────────────────── */}
                        <Link
                            href="/"
                            className="flex items-center gap-2 shrink-0"
                        >
                            <span className="font-display text-xl font-bold text-[var(--color-primary)] tracking-tight">
                                MADEVIC
                            </span>
                            <span className="hidden sm:block text-xs text-[var(--color-on-surface-variant)] border-l border-[var(--color-outline-variant)] pl-2">
                                Esencia de la Madera
                            </span>
                        </Link>

                        {/* ── Nav links — desktop ─────────────────────────── */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={clsx(
                                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                                        pathname === link.href
                                            ? "bg-[var(--color-primary-fixed)] text-[var(--color-primary)]"
                                            : "text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]"
                                    )}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* ── Acciones ────────────────────────────────────── */}
                        <div className="flex items-center gap-1">

                            {/* Búsqueda */}
                            <Link
                                href="/catalogo"
                                className="btn btn-ghost btn-sm p-2 rounded-lg"
                                aria-label="Buscar"
                            >
                                <Search size={20} />
                            </Link>

                            {/* Wishlist — solo si está logueado */}
                            {profile && (
                                <Link
                                    href="/cuenta/favoritos"
                                    className="btn btn-ghost btn-sm p-2 rounded-lg"
                                    aria-label="Favoritos"
                                >
                                    <Heart size={20} />
                                </Link>
                            )}

                            {/* Carrito */}
                            <button
                                onClick={() => toggleCart()}
                                className="btn btn-ghost btn-sm p-2 rounded-lg relative"
                                aria-label="Carrito"
                            >
                                <ShoppingCart size={20} />
                                {totalItems > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--color-secondary)] text-white text-[10px] font-bold flex items-center justify-center">
                                        {totalItems > 9 ? "9+" : totalItems}
                                    </span>
                                )}
                            </button>

                            {/* Usuario */}
                            {profile ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen((v) => !v)}
                                        className="btn btn-ghost btn-sm p-2 rounded-lg flex items-center gap-2"
                                        aria-label="Mi cuenta"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-[var(--color-primary-fixed)] flex items-center justify-center">
                                            <span className="text-xs font-semibold text-[var(--color-primary)]">
                                                {profile.full_name?.charAt(0).toUpperCase() ?? "U"}
                                            </span>
                                        </div>
                                    </button>

                                    {/* Dropdown usuario */}
                                    {userMenuOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setUserMenuOpen(false)}
                                            />
                                            <div className="absolute right-0 top-full mt-2 w-52 bg-[var(--color-surface-bright)] rounded-xl border border-[var(--color-outline-variant)] shadow-[var(--shadow-modal)] z-20 overflow-hidden animate-[scale-in_0.15s_ease-out]">
                                                <div className="px-4 py-3 border-b border-[var(--color-outline-variant)]">
                                                    <p className="text-sm font-medium text-[var(--color-on-surface)] truncate">
                                                        {profile.full_name || "Usuario"}
                                                    </p>
                                                    <p className="text-xs text-[var(--color-on-surface-variant)] truncate">
                                                        {profile.email}
                                                    </p>
                                                </div>
                                                <div className="py-1">
                                                    <Link
                                                        href="/cuenta"
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)] transition-colors"
                                                    >
                                                        <User size={16} />
                                                        Mi cuenta
                                                    </Link>
                                                    <Link
                                                        href="/cuenta/pedidos"
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)] transition-colors"
                                                    >
                                                        <Package size={16} />
                                                        Mis pedidos
                                                    </Link>
                                                    {(profile.role === "admin_principal" ||
                                                        profile.role === "operador") && (
                                                            <Link
                                                                href="/admin/dashboard"
                                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-secondary)] hover:bg-[var(--color-surface-container)] transition-colors"
                                                            >
                                                                <Settings size={16} />
                                                                Panel admin
                                                            </Link>
                                                        )}
                                                </div>
                                                <div className="py-1 border-t border-[var(--color-outline-variant)]">
                                                    <button
                                                        onClick={handleSignOut}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-error)] hover:bg-[var(--color-error-container)] transition-colors"
                                                    >
                                                        <LogOut size={16} />
                                                        Cerrar sesión
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="btn btn-primary btn-sm hidden sm:flex"
                                >
                                    Iniciar sesión
                                </Link>
                            )}

                            {/* Menú móvil */}
                            <button
                                onClick={() => setMobileOpen((v) => !v)}
                                className="btn btn-ghost btn-sm p-2 rounded-lg md:hidden"
                                aria-label="Menú"
                            >
                                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* ── Menú móvil desplegable ───────────────────────── */}
                    {mobileOpen && (
                        <div className="md:hidden border-t border-[var(--color-outline-variant)] py-3 space-y-1 animate-[fade-in-up_0.2s_ease-out]">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={clsx(
                                        "block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                        pathname === link.href
                                            ? "bg-[var(--color-primary-fixed)] text-[var(--color-primary)]"
                                            : "text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]"
                                    )}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {!profile && (
                                <Link
                                    href="/login"
                                    className="block px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-surface-container)]"
                                >
                                    Iniciar sesión
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* Cart Drawer */}
            <CartDrawer />
        </>
    );
}