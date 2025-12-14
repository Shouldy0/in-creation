'use server';

import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { checkObserverMode } from '@/utils/access';

const ProcessSchema = z.object({
    title: z.string().optional(), // Optional for drafts
    description: z.string().optional(),
    phase: z.enum(['Idea', 'Blocked', 'Flow', 'Revision', 'Finished']),
    visibility: z.enum(['public', 'private']),
    status: z.enum(['draft', 'published']),
    media_url: z.string().optional(),
    media_type: z.enum(['image', 'audio']).optional(),
    reflection_question: z.string().optional(),
});

// 1. Create Draft (Called on visiting /process/new)
export async function createDraftProcess() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Check Observer Mode
    const status = await checkObserverMode(user.id);
    if (!status.canPost) {
        return { success: false, error: `Observer Mode: You can create processes in ${status.daysLeft} days.` };
    }

    // Ensure profile exists to satisfy foreign key constraint
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single();
    if (!profile) {
        // Fallback: Create profile if trigger failed
        await supabase.from('profiles').insert({
            id: user.id,
            username: user.email?.split('@')[0], // Fallback username
            full_name: 'Artist',
        });
    }

    const { data, error } = await supabase
        .from('processes')
        .insert({
            user_id: user.id,
            title: '', // Empty initially
            description: '',
            phase: 'Idea',
            status: 'draft',
            visibility: 'public', // Default to public visibility (takes effect on publish)
        })
        .select()
        .single();

    if (error) {
        console.error('Create draft error:', error);
        return { success: false, error: `Supabase Error: ${(error as any).message} (${(error as any).code})` };
    }

    if (!data) {
        console.error('Create draft error: No data returned');
        return { success: false, error: 'Draft created but no data returned. RLS Policy?' };
    }

    return { success: true, data: data.id };
}

// 2. Autosave (Called periodically)
export async function updateProcessAutosave(id: string, formData: Partial<z.infer<typeof ProcessSchema>>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // We trust the partial data, Zod validation is loose for drafts
    const { error } = await supabase
        .from('processes')
        .update({
            ...formData,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error('Autosave error:', error);
        throw new Error('Autosave failed');
    }

    revalidatePath(`/process/${id}`);
    return { success: true };
}

// 3. Publish (Called on "Publish" button)
export async function publishProcess(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // Check Observer Mode - Soft Limit (Allow 1 post)
    const status = await checkObserverMode(user.id);
    if (!status.canPost) {
        // Check how many published processes they have
        const { count } = await supabase
            .from('processes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'published');

        if (count && count >= 1) {
            throw new Error(`Observer Mode: You can publish 1 process during your first 3 days. (${status.daysLeft} days left in observation mode)`);
        }
    }

    // Fetch to validate 'required' fields for publishing
    const { data: process } = await supabase.from('processes').select('*').eq('id', id).single();

    if (!process.description && !process.media_url) {
        throw new Error("Add a description or media to publish.");
    }

    // Set status to published
    const { error } = await supabase
        .from('processes')
        .update({
            status: 'published',
            // Ensure visibility is correct, could force public here
            visibility: 'public',
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) throw new Error("Failed to publish");

    revalidatePath('/feed');
    revalidatePath(`/process/${id}`);
    redirect(`/process/${id}`);
}


export async function deleteProcess(processId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from('processes')
        .delete()
        .eq('id', processId)
        .eq('user_id', user.id); // Double check ownership

    if (error) throw new Error("Failed to delete");

    revalidatePath('/feed');
    redirect('/feed');
}
