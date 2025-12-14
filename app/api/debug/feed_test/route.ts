import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('processes')
            .select('id, title')
            .limit(5);

        if (error) {
            return NextResponse.json({ error: error }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
