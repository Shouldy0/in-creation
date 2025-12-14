import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    try {
        // Use Anon Key (simulating client/server logic)
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Replicating the query from actions/feed.ts
        const { data, error } = await supabase
            .from('processes')
            .select(`
                *,
                profiles:user_id (
                    username,
                    username,
                    current_state,
                    disciplines
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({
                success: false,
                error: error,
                message: error.message,
                hint: error.hint,
                details: error.details
            }, { status: 200 });
        }

        return NextResponse.json({ success: true, count: data?.length, data: data });

    } catch (e: any) {
        return NextResponse.json({
            error: e.message,
            stack: e.stack,
            envCheck: {
                hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
            }
        }, { status: 200 });
    }
}
