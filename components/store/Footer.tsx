import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-[var(--color-inverse-surface)] text-[var(--color-inverse-on-surface)] mt-auto">
            <div className="container-madevic py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Marca */}
                    <div>
                        <h3 className="font-display text-lg font-bold text-[var(--color-inverse-primary)] mb-2">
                            MADEVIC
                        </h3>
                        <p className="text-sm text-[var(--color-inverse-on-surface)] opacity-70 leading-relaxed">
                            Esencia de la Madera. Mobiliario artesanal cubano elaborado
                            con recortería de madera. Piezas únicas hechas a pedido.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3 text-[var(--color-inverse-primary)]">
                            Tienda
                        </h4>
                        <ul className="space-y-2 text-sm opacity-70">
                            <li>
                                <Link href="/catalogo" className="hover:opacity-100 transition-opacity">
                                    Catálogo
                                </Link>
                            </li>
                            <li>
                                <Link href="/cuenta/favoritos" className="hover:opacity-100 transition-opacity">
                                    Favoritos
                                </Link>
                            </li>
                            <li>
                                <Link href="/cuenta/pedidos" className="hover:opacity-100 transition-opacity">
                                    Mis pedidos
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contacto */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3 text-[var(--color-inverse-primary)]">
                            Contacto
                        </h4>
                        <ul className="space-y-2 text-sm opacity-70">
                            <li>La Habana, Cuba</li>
                            <li>
                                <a
                                    href="mailto:contacto@madevic.cu"
                                    className="hover:opacity-100 transition-opacity"
                                >
                                    contacto@madevic.cu
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs opacity-50">
                    <p>© {new Date().getFullYear()} MADEVIC. Todos los derechos reservados.</p>
                    <p>Industria Cubana del Mueble DUJO</p>
                </div>
            </div>
        </footer >
    );
}