'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateCreativeState(newState: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Not authenticated');
    }

    const { error } = await supabase
        .from('profiles')
        .update({ current_state: newState })
        .eq('id', user.id);

    if (error) {
        throw new Error('Failed to update creative state');
    }

    revalidatePath('/feed');
    revalidatePath('/profile');
    return { success: true };
}
