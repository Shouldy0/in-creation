'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createCoProcess(title: string, description: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Not authenticated');
    }

    // MVP Rule: Check if user already has an active co-process
    // Since we are owner, we check if we own any active one
    const { data: existing } = await supabase
        .from('co_processes')
        .select('id')
        .eq('owner_id', user.id)
        .eq('status', 'active')
        .single();

    if (existing) {
        throw new Error('You already have an active co-process.');
    }

    const { data, error } = await supabase
        .from('co_processes')
        .insert({
            title,
            description,
            owner_id: user.id,
            status: 'active'
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating co-process:', error);
        throw new Error('Failed to create co-process');
    }

    // Add owner as member
    const { error: memberError } = await supabase
        .from('co_process_members')
        .insert({
            co_process_id: data.id,
            user_id: user.id,
            role: 'owner'
        });

    if (memberError) {
        console.error('Error adding owner as member:', memberError);
        // Cleanup if possible or just throw
        throw new Error('Failed to initialize members');
    }

    revalidatePath('/co-process');
    return data;
}

export async function getCoProcess(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from('co_processes')
        .select(`
      *,
      members:co_process_members(user_id, role, joined_at, profiles(*)),
      entries:co_process_entries(*, feedback:co_process_feedback(*, profiles(*)))
    `)
        .eq('id', id)
        .single();

    if (error || !data) return null;

    // Verify membership
    const isMember = data.members.some((m: any) => m.user_id === user.id);
    if (!isMember) return null;

    return data;
}

export async function addEntry(coProcessId: string, content: string, mediaUrl?: string, mediaType?: 'image' | 'audio' | 'video') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('co_process_entries')
        .insert({
            co_process_id: coProcessId,
            user_id: user.id,
            content,
            media_url: mediaUrl,
            media_type: mediaType
        });

    if (error) {
        console.error('Error adding entry:', error);
        throw new Error('Failed to add entry');
    }

    revalidatePath(`/co-process/${coProcessId}`);
}

export async function addFeedback(entryId: string, type: 'works' | 'needs_work' | 'inspired' | 'resonance', content?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('co_process_feedback')
        .insert({
            entry_id: entryId,
            user_id: user.id,
            type,
            content
        });

    if (error) {
        console.error('Error adding feedback:', error);
        throw new Error('Failed to add feedback');
    }

    // We would need to know the co_process_id to revalidate the path efficiently.
    // For now we might depend on client side or fetch it.
    // simpler: Let client handle revalidation or return success.
}

export async function inviteMember(coProcessId: string, username: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    // Verify owner
    const { data: coProcess } = await supabase
        .from('co_processes')
        .select('owner_id, members:co_process_members(count)')
        .eq('id', coProcessId)
        .single();

    if (!coProcess || coProcess.owner_id !== user.id) {
        throw new Error('Only owner can invite.');
    }

    // specific casting because count is complicated in joined result
    // Assuming we do a separate count check or rely on array length if we fetched members
    // Let's do a direct count check for safety
    const { count } = await supabase
        .from('co_process_members')
        .select('*', { count: 'exact', head: true })
        .eq('co_process_id', coProcessId);

    if (count && count >= 4) {
        throw new Error('Co-process is full (max 4 members).');
    }

    // Find user by username
    const { data: invitee } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

    if (!invitee) {
        throw new Error('User not found.');
    }

    const { error } = await supabase
        .from('co_process_members')
        .insert({
            co_process_id: coProcessId,
            user_id: invitee.id,
            role: 'member'
        });

    if (error) {
        throw new Error('Failed to add member (maybe already added?)');
    }

    revalidatePath(`/co-process/${coProcessId}`);
}

export async function closeCoProcess(coProcessId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('co_processes')
        .update({ status: 'archived' })
        .eq('id', coProcessId)
        .eq('owner_id', user.id); // Security: only owner

    if (error) {
        throw new Error('Failed to close co-process');
    }

    revalidatePath(`/co-process/${coProcessId}`);
}
