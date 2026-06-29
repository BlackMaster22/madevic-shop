import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(
                    cookiesToSet: Array<{
                        name: string;
                        value: string;
                        options?: Record<string, unknown>;
                    }>
                ) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options ?? {})
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const isAdminRoute = pathname.startsWith("/admin");
    const isProtectedRoute = ["/cuenta", "/checkout"].some((r) =>
        pathname.startsWith(r)
    );
    const isAuthRoute = ["/login", "/register"].some((r) =>
        pathname.startsWith(r)
    );

    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    if (isProtectedRoute && !user) {
        const url = new URL("/login", request.url);
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
    }

    if (isAdminRoute) {
        if (!user) {
            const url = new URL("/login", request.url);
            url.searchParams.set("redirect", pathname);
            return NextResponse.redirect(url);
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        const allowed =
            (profile as unknown as { role: string })?.role === "admin_principal" ||
            (profile as unknown as { role: string })?.role === "operador";

        if (!allowed) {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
    ],
};