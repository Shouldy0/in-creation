'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleResonance(processId: string, blockIndex: number | null = null): Promise<{ hasResonated: boolean }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Check if exists
    let query = supabase
        .from('resonances')
        .select('id')
        .eq('process_id', processId)
        .eq('user_id', user.id);

    if (blockIndex !== null) {
        query = query.eq('block_index', blockIndex);
    } else {
        query = query.is('block_index', null);
    }

    const { data: existing } = await query.single();

    if (existing) {
        // Delete
        await supabase
            .from('resonances')
            .delete()
            .eq('id', existing.id);

        revalidatePath(`/process/${processId}`);
        revalidatePath('/feed');
        return { hasResonated: false };
    } else {
        // Create
        await supabase
            .from('resonances')
            .insert({
                process_id: processId,
                user_id: user.id,
                block_index: blockIndex
            });

        revalidatePath(`/process/${processId}`);
        revalidatePath('/feed');
        return { hasResonated: true };
    }
}

export async function getResonanceStatus(processId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch ALL resonances for this process
    const { data: allResonances } = await supabase
        .from('resonances')
        .select('user_id, block_index')
        .eq('process_id', processId);

    // Organization structure:
    // blocks: { [index: number]: { hasResonated: boolean, count: number } }
    // general: { hasResonated: boolean, count: number } (where block_index is null)

    const blocks: Record<number, { hasResonated: boolean, count: number }> = {};
    let general = { hasResonated: false, count: 0 };

    if (allResonances) {
        allResonances.forEach((r: any) => {
            const isMe = user && r.user_id === user.id;

            if (r.block_index === null) {
                general.count++;
                if (isMe) general.hasResonated = true;
            } else {
                const idx = r.block_index;
                if (!blocks[idx]) blocks[idx] = { hasResonated: false, count: 0 };
                blocks[idx].count++;
                if (isMe) blocks[idx].hasResonated = true;
            }
        });
    }

    return {
        general,
        blocks
    };
}
