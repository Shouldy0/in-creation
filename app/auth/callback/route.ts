
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    // The `/auth/callback` route is required for the server-side auth flow implemented
    // by the SSR package. It exchanges an auth code for the user's session.
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const origin = requestUrl.origin;

    if (code) {
        const supabase = await createClient();
        await supabase.auth.exchangeCodeForSession(code);

        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .single();

            if (profile) {
                return NextResponse.redirect(`${origin}/profile/${user.id}`);
            } else {
                return NextResponse.redirect(`${origin}/onboarding`);
            }
        }
    }

    // Fallback if something goes wrong (e.g. no code, or no user found after exchange)
    return NextResponse.redirect(`${origin}/onboarding`);
}
