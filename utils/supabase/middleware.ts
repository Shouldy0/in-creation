import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Configuration Safeguard
    if (!supabaseUrl || !supabaseKey) {
        if (!request.nextUrl.pathname.startsWith('/setup')) {
            return NextResponse.redirect(new URL('/setup', request.url));
        }
        return response; // Allow access to /setup
    }

    // If we are on /setup but keys ARE present, redirect to home
    if (request.nextUrl.pathname.startsWith('/setup') && supabaseUrl && supabaseKey) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Protected Routes Pattern
    // Protected Routes Pattern
    // We allow Public access to /feed, /profile, /process
    // We strictly protect /settings, /onboarding, /process/start, /process/[id]/edit
    if (
        request.nextUrl.pathname.startsWith('/settings') ||
        request.nextUrl.pathname.startsWith('/onboarding') ||
        request.nextUrl.pathname.startsWith('/process/start') ||
        request.nextUrl.pathname.includes('/edit')
    ) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Auth Routes Pattern (redirect to feed if already logged in)
    if (
        request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/signup')
    ) {
        if (user) {
            return NextResponse.redirect(new URL('/feed', request.url))
        }
    }

    return response
}
