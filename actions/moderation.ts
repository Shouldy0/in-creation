'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function blockUser(blockerId: string, blockedId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== blockerId) throw new Error("Unauthorized");

    await supabase.from('blocks').insert({
        blocker_id: blockerId,
        blocked_id: blockedId
    });

    revalidatePath('/feed');
}

export async function reportContent(targetId: string, targetType: 'process' | 'feedback' | 'profile', reason: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    await supabase.from('reports').insert({
        reporter_id: user.id,
        target_id: targetId,
        target_type: targetType,
        reason
    });
}
