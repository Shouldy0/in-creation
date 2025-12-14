import { createClient } from '@/utils/supabase/server';

export const OBSERVER_PERIOD_DAYS = 3;

export type AccessStatus = {
    isObserver: boolean;
    daysLeft: number;
    canPost: boolean;
    canMessage: boolean;
};

export async function checkObserverMode(userId: string): Promise<AccessStatus> {
    const supabase = await createClient();

    const { data: profile } = await supabase
        .from('profiles')
        .select('joined_at, is_flagged')
        .eq('id', userId)
        .single();

    if (!profile) {
        // Fallback or error state
        return { isObserver: true, daysLeft: 3, canPost: false, canMessage: false };
    }

    if (profile.is_flagged) {
        return { isObserver: true, daysLeft: 999, canPost: false, canMessage: false };
    }

    const joinedAt = new Date(profile.joined_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinedAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Observer logic: Active if joined less than 3 days ago
    // Wait, diffDays is rounded up.
    // If just joined: diff ~0 -> diffDays 0? No, ceil > 0.
    // Let's use milliseconds.
    const ONE_DAY_MS = 1000 * 60 * 60 * 24;
    const daysSinceJoin = (now.getTime() - joinedAt.getTime()) / ONE_DAY_MS;

    const isObserver = daysSinceJoin < OBSERVER_PERIOD_DAYS;
    const daysLeft = Math.ceil(OBSERVER_PERIOD_DAYS - daysSinceJoin);

    return {
        isObserver,
        daysLeft: isObserver ? daysLeft : 0,
        canPost: !isObserver,
        canMessage: !isObserver
    };
}
