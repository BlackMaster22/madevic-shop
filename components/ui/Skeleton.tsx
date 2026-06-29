import { clsx } from "clsx";

interface SkeletonProps {
    className?: string;
    height?: string | number;
    width?: string | number;
    rounded?: "sm" | "md" | "lg" | "xl" | "full";
}

export function Skeleton({ className, height, width, rounded = "lg" }: SkeletonProps) {
    const roundedMap = {
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        full: "rounded-full",
    };

    return (
        <div
            className={clsx("skeleton", roundedMap[rounded], className)}
            style={{
                height: height ? (typeof height === "number" ? `${height}px` : height) : undefined,
                width: width ? (typeof width === "number" ? `${width}px` : width) : undefined,
            }}
        />
    );
}

// ── Skeleton de ProductCard ───────────────────────────────────
export function ProductCardSkeleton() {
    return (
        <div className="card overflow-hidden">
            <Skeleton height={220} rounded="xl" className="rounded-b-none w-full" />
            <div className="p-4 space-y-3">
                <Skeleton height={12} width="60%" />
                <Skeleton height={18} width="80%" />
                <Skeleton height={14} width="40%" />
                <div className="flex gap-2 pt-2">
                    <Skeleton height={36} className="flex-1" />
                    <Skeleton height={36} width={36} rounded="lg" />
                </div>
            </div>
        </div>
    );
}

// ── Skeleton de tabla admin ───────────────────────────────────
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
    return (
        <tr>
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <Skeleton height={14} width={i === 0 ? "80%" : "60%"} />
                </td>
            ))}
        </tr>
    );
}