'use server';

import { createClient } from '@/utils/supabase/server';

export type FeedFilters = {
    disciplines?: string[];
    phases?: string[];
    needsFeedback?: boolean;
    type?: 'state' | 'following';
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

    if (!currentUserProfile) return [];



    // 1. Get user's blocked list to exclude
    let blockedIds: string[] = [];
    const { data: blocks } = await supabase
        .from('blocks')
        .select('blocked_id')
        .eq('blocker_id', user.id);
    if (blocks) blockedIds = blocks.map(b => b.blocked_id);

    // 2. Build Base Query
    // 3. Apply Filters and Select
    // Add resonance count to selection
    // Note: We need to modify the select string.
    // Re-writing the select to include count.

    // Actually, I can't modify the query object easily after creation.
    // I should rewrite step 2.

    // START REWRITE: Manual Joins for Stability
    // 1. Fetch Processes + Profiles (Profiles FK is usually robust or required)
    let selectQuery = `
            *,
            profiles (
                username,
                current_state,
                avatar_url,
                disciplines
            )
    `;

    // Re-initializing query with new select
    let mainQuery = supabase
        .from('processes')
        .select(selectQuery)
        .eq('status', 'published')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

    // Apply Filters
    if (filters.type === 'following') {
        const { data: follows } = await supabase.from('follows').select('followed_id').eq('follower_id', user.id);
        const followedIds = follows?.map(f => f.followed_id) || [];
        if (followedIds.length === 0) return [];
        mainQuery = mainQuery.in('user_id', followedIds);
    }

    if (blockedIds.length > 0) {
        mainQuery = mainQuery.not('user_id', 'in', `(${blockedIds.join(',')})`);
    }

    if (filters.phases && filters.phases.length > 0) {
        mainQuery = mainQuery.in('phase', filters.phases);
    }

    const { data, error } = await mainQuery;

    if (error) {
        console.error('Feed Error:', error);
        return [];
    }

    let filteredData = data || [];

    // Filter: Disciplines (In-Memory)
    if (filters.disciplines && filters.disciplines.length > 0) {
        filteredData = filteredData.filter((post: any) => {
            if (!post.profiles) return false; // Skip posts with no profile
            const authorDisciplines = post.profiles.disciplines || [];
            return filters.disciplines!.some((d: string) => authorDisciplines.includes(d));
        });
    }

    // --- MANUAL JOINS ---
    const processIds = filteredData.map((p: any) => p.id);

    // A. Fetch Feedback Counts (if needed for filter or display)
    // Even if not filtering, "Needs Feedback" badge might rely on it? 
    // The filter relies on it.
    let feedbackCounts: Record<string, number> = {};
    if (processIds.length > 0) {
        // This is a bit tricky to get counts by group in Supabase without rpc
        // But we can just fetch all feedback for these posts (lightweight id)
        // Or rely on the fact that MVP scale is small.
        const { data: fb } = await supabase
            .from('feedback')
            .select('post_id')
            .in('post_id', processIds);

        fb?.forEach((f: any) => {
            feedbackCounts[f.post_id] = (feedbackCounts[f.post_id] || 0) + 1;
        });
    }

    // Filter: Needs Feedback (count === 0)
    if (filters.needsFeedback) {
        filteredData = filteredData.filter((post: any) => {
            return (feedbackCounts[post.id] || 0) === 0;
        });
        // Re-calculate processIds after filtering? 
        // No, we already fetched everything, just filtering the result list.
    }

    // B. Fetch Resonances (Count & My Status)
    let resonanceCounts: Record<string, number> = {};
    let myResonances: Set<string> = new Set();

    if (processIds.length > 0) {
        const { data: res } = await supabase
            .from('resonances')
            .select('process_id, user_id')
            .in('process_id', processIds);

        res?.forEach((r: any) => {
            resonanceCounts[r.process_id] = (resonanceCounts[r.process_id] || 0) + 1;
            if (r.user_id === user.id) {
                myResonances.add(r.process_id);
            }
        });
    }

    // 5. Merge Data
    const enrichedData = filteredData.map((post: any) => ({
        ...post,
        hasResonated: myResonances.has(post.id),
        resonanceCount: resonanceCounts[post.id] || 0,
        feedbackCount: feedbackCounts[post.id] || 0 // Added for good measure
    }));

    return enrichedData;
}
