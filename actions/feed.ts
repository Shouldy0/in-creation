'use server';

import { createClient } from '@/utils/supabase/server';

export type FeedFilters = {
    disciplines?: string[];
    phases?: string[];
    needsFeedback?: boolean;
};

export async function getFeed(filters: FeedFilters = {}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    // 0. Get current user's profile to know their creative state
    const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('current_state')
        .eq('id', user.id)
        .single();

    if (!currentUserProfile?.current_state) return [];

    // 1. Get user's blocked list to exclude
    let blockedIds: string[] = [];
    const { data: blocks } = await supabase
        .from('blocks')
        .select('blocked_id')
        .eq('blocker_id', user.id);
    if (blocks) blockedIds = blocks.map(b => b.blocked_id);

    // 2. Build Base Query
    // STRICT RULE: Only show processes from authors in the SAME creative state
    let query = supabase
        .from('processes')
        .select(`
            *,
            profiles!inner (
                username,
                current_state,
                avatar_url,
                disciplines
            ),
            feedback (id)
        `)
        .eq('status', 'published')
        .eq('visibility', 'public')
        .eq('profiles.current_state', currentUserProfile.current_state)
        .neq('user_id', user.id) // Optional: Don't show my own posts in feed? Usually yes for "discovery".
        .order('created_at', { ascending: false });

    // 3. Apply Filters

    // Filter: Blocked Users
    if (blockedIds.length > 0) {
        query = query.not('user_id', 'in', `(${blockedIds.join(',')})`);
    }

    // Filter: Phases
    if (filters.phases && filters.phases.length > 0) {
        query = query.in('phase', filters.phases);
    }

    // Filter: Disciplines (requires careful handling as it's an array column on joined table)
    // Supabase filtering on joined table array columns can be tricky.
    // For MVP, if easy filtering on joined column isn't working, we might filter in memory or specific RPC.
    // Let's try standard filter first. NOTE: Supabase JS client doesn't support 'contains' on joined tables easily in all versions.
    // simpler approach: We fetch and then filter in memory for disciplines if the result set isn't massive.
    // However, let's try to do it if possible. 
    // Actually, 'profiles.disciplines' overlaps with user selected disciplines. 
    // It is simpler to do this in memory for MVP or just skip it if complex.
    // Let's implement in memory for safely since we already filtering by state heavily reducing dataset.

    const { data, error } = await query;

    if (error) {
        console.error('------- FEED ERROR DETAILS -------');
        console.error('User ID:', user.id);
        console.error('Status:', error.code, error.message, error.details, error.hint);
        console.error('Full Error:', JSON.stringify(error, null, 2));
        console.error('----------------------------------');
        return [];
    }

    let filteredData = data || [];

    // 4. In-Memory Filters (for complexity reduction on DB query)

    // Filter: Disciplines (if Author has ANY of the selected disciplines)
    if (filters.disciplines && filters.disciplines.length > 0) {
        filteredData = filteredData.filter((post: any) => {
            const authorDisciplines = post.profiles.disciplines || [];
            return filters.disciplines!.some(d => authorDisciplines.includes(d));
        });
    }

    // Filter: Needs Feedback (count === 0)
    // Note: feedback(count) returns an array like [{count: 0}]
    if (filters.needsFeedback) {
        filteredData = filteredData.filter((post: any) => {
            const feedbackCount = post.feedback?.length || 0;
            return feedbackCount === 0;
        });
    }

    return filteredData;
}
