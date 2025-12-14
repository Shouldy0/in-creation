import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkMedia() {
    const { data, error } = await supabase
        .from('processes')
        .select('id, title, media_url, media_type, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Recent Processes:");
        data.forEach(p => {
            console.log(`[${p.id}] ${p.title}`);
            console.log(`   Media: ${p.media_url} (${p.media_type})`);
        });
    }
}

checkMedia();
