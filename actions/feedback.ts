'use server';

import { z } from 'zod';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

const FeedbackSchema = z.object({
    processId: z.string().uuid(),
    type: z.enum(['works', 'doesnt_work', 'inspired']),
    content: z.string().min(1, "Content is required").max(1000, "Content too long"),
    parentId: z.string().uuid().optional().nullable(),
});

export async function addFeedback(processId: string, type: string, content: string, parentId?: string | null) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    const validated = FeedbackSchema.parse({ processId, type, content, parentId });

    const { error } = await supabase.from('feedback').insert({
        post_id: validated.processId,
        user_id: user.id,
        type: validated.type,
        content: validated.content,
        parent_id: validated.parentId || null
    });

    if (error) {
        console.error('Feedback error:', error);
        throw new Error('Failed to post feedback');
    }

    revalidatePath(`/process/${processId}`);
}

export async function getFeedback(processId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('feedback')
        .select(`
            *,
            profiles:user_id (
                username, avatar_url
            )
        `)
        .eq('post_id', processId)
        .order('created_at', { ascending: true }); // Oldest first
    return data || [];
}
