import { Suspense } from "react";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";

export default function StoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
            <Suspense fallback={null}>
                <Navbar />
            </Suspense>
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}