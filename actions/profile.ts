'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: {
    username?: string;
    bio?: string;
    disciplines?: string[];
    current_state?: 'Idea' | 'Blocked' | 'Flow' | 'Revision' | 'Resting';
    avatar_url?: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Not authenticated');
    }

    const { error } = await supabase
        .from('profiles')
        .update({
            ...formData,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

    if (error) {
        console.error('Update profile error:', error);
        throw new Error('Failed to update profile');
    }

    revalidatePath('/profile');
    revalidatePath('/settings');
}

export async function getProfile(userId?: string) {
    const supabase = await createClient();
    // If userId not provided, get current user's profile
    let targetId = userId;

    if (!targetId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        targetId = user.id;
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .single();

    if (error) return null;
    return data;
}
