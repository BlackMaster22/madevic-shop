import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MADEVIC — Esencia de la Madera",
    template: "%s | MADEVIC",
  },
  description:
    "Mobiliario artesanal cubano elaborado con la esencia de la madera. Piezas únicas hechas a pedido.",
  keywords: ["muebles", "artesanal", "madera", "cuba", "mobiliario", "madevic"],
  authors: [{ name: "MADEVIC — Industria Cubana del Mueble DUJO" }],
  openGraph: {
    type: "website",
    locale: "es_CU",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "MADEVIC",
    title: "MADEVIC — Esencia de la Madera",
    description: "Mobiliario artesanal cubano elaborado con la esencia de la madera.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: "toast-madevic",
            success: {
              iconTheme: { primary: "#7c5730", secondary: "#ffffff" },
            },
            error: {
              iconTheme: { primary: "#ba1a1a", secondary: "#ffffff" },
            },
          }}
        />
      </body>
    </html>
  );
}