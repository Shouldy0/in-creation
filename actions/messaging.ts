'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { checkObserverMode } from '@/utils/access';

export async function createConversation(participantId: string, contextType: 'process' | 'profile' | 'commission', contextId?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Check Observer Mode
    const status = await checkObserverMode(user.id);
    if (!status.canMessage) {
        throw new Error(`Observer Mode: You can start conversations in ${status.daysLeft} days.`);
    }

    // 1. Check if conversation already exists
    // We can try to select one with these params
    // Note: participant_a and participant_b ordering is enforced by DB constraint usually, 
    // but here we just query for "matches user and participant".

    // Actually, simply trying to INSERT will fail if unique constraint is hit, 
    // but we want to fail gracefully and return the existing ID.

    // Let's try to find it first.
    // Query is tricky because user could be A or B.

    let query = supabase.from('conversations')
        .select('id')
        .eq('context_type', contextType)
        .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
        .or(`participant_a.eq.${participantId},participant_b.eq.${participantId}`);

    if (contextId) {
        query = query.eq('context_id', contextId);
    } else {
        query = query.is('context_id', null);
    }

    const { data: existing, error: fetchError } = await query;

    // Filter results in memory to ensure exact match of the pair (Supabase OR logic can be loose)
    // Actually, simpler:
    // If I am A, other is B. OR I am B, other is A.
    // AND context matches.

    const validExisting = existing?.find(c => true); // logic above is already filtering quite well but technically `or` + `or` could match distinct rows?
    // Let's rely on the unique constraint via UPSERT or strict query.

    // Proper way:
    // Sort IDs to match DB constraint logic if we were inserting manually, 
    // but for SELECT we just check both permutations.

    // Let's Try Insert and on Conflict Do Nothing, then Select.
    // But we need to know the IDs order.

    const [id1, id2] = [user.id, participantId].sort();

    // Upsert isn't great if we just want to "Get or Create".

    const { data: inserted, error } = await supabase
        .from('conversations')
        .insert({
            participant_a: id1,
            participant_b: id2,
            context_type: contextType,
            context_id: contextId || null
        })
        .select()
        .single();

    if (error) {
        // likely duplicate key error
        if (error.code === '23505') { // Unique violation
            const { data: found } = await supabase
                .from('conversations')
                .select('id')
                .eq('participant_a', id1)
                .eq('participant_b', id2)
                .eq('context_type', contextType)
                .is('context_id', contextId || null)
                .single();

            if (found) return found.id;
        }
        console.error("Error creating conversation:", error);
        throw new Error("Failed to start conversation");
    }

    return inserted.id;
}

export async function sendMessage(conversationId: string, content: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");
    if (!content.trim()) return;

    const { error } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            content: content.trim()
        });

    if (error) {
        console.error("Error sending message:", error);
        throw new Error("Failed to send");
    }

    revalidatePath(`/messages/${conversationId}`);
}


export async function getConversation(conversationId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch conversation details + messages
    // We need to know who the "Other" participant is for the UI header

    const { data: conversation } = await supabase
        .from('conversations')
        .select(`
            *,
            p1:participant_a (username, avatar_url, id),
            p2:participant_b (username, avatar_url, id)
        `)
        .eq('id', conversationId)
        .single();

    if (!conversation) return null;

    // Verify participation (RLS does this but good for type safety return)
    const isParticipant = conversation.participant_a === user.id || conversation.participant_b === user.id;
    if (!isParticipant) return null;

    // Fetch messages
    const { data: messages } = await supabase
        .from('messages')
        .select(`
            *,
            profiles:sender_id (username, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true }); // Chat order

    return {
        conversation,
        messages,
        currentUser: user
    };
}
