import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-wood-pattern flex flex-col">
            {/* Header simple */}
            <header className="py-5 px-6">
                <Link
                    href="/"
                    className="font-display text-xl font-bold text-[var(--color-primary)]"
                >
                    MADEVIC
                </Link>
            </header>

            {/* Contenido centrado */}
            <main className="flex-1 flex items-center justify-center px-4 py-10">
                {children}
            </main>

            <footer className="py-4 text-center text-xs text-[var(--color-on-surface-variant)]">
                © {new Date().getFullYear()} MADEVIC — Industria Cubana del Mueble DUJO
            </footer>
        </div>
    );
}