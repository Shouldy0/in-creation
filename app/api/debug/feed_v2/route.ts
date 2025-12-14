import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // 1. Inspect Profiles Table Columns directly
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);

        // 2. Try the Join Query WITHOUT avatar_url
        const { data: feed, error: feedError } = await supabase
            .from('processes')
            .select(`
                *,
                profiles (
                    username
                )
            `)
            .limit(1);

        return NextResponse.json({
            profiles_sample: profiles,
            profiles_error: profileError,
            feed_sample: feed,
            feed_error: feedError
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 200 });
    }
}
