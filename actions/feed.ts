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

    // 0. Get current user's profile context (if logged in)
    let currentUserProfile = null;
    let blockedIds: string[] = [];

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('current_state')
            .eq('id', user.id)
            .single();
        currentUserProfile = profile;

        // 1. Get user's blocked list to exclude
        const { data: blocks } = await supabase
            .from('blocks')
            .select('blocked_id')
            .eq('blocker_id', user.id);
        if (blocks) blockedIds = blocks.map(b => b.blocked_id);
    }

    // 2. Build Base Query
    let selectQuery = `
            *,
            profiles (
                username,
                current_state,
                avatar_url,
                disciplines
            )
    `;

    let mainQuery = supabase
        .from('processes')
        .select(selectQuery)
        .eq('status', 'published')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

    // Apply Filters
    if (filters.type === 'following') {
        if (!user) return []; // Guests cannot have following feed
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
            if (!post.profiles) return false;
            const authorDisciplines = post.profiles.disciplines || [];
            return filters.disciplines!.some((d: string) => authorDisciplines.includes(d));
        });
    }

    // --- MANUAL JOINS ---
    const processIds = filteredData.map((p: any) => p.id);

    // A. Fetch Feedback Counts
    let feedbackCounts: Record<string, number> = {};
    if (processIds.length > 0) {
        const { data: fb } = await supabase
            .from('feedback')
            .select('post_id')
            .in('post_id', processIds);

        fb?.forEach((f: any) => {
            feedbackCounts[f.post_id] = (feedbackCounts[f.post_id] || 0) + 1;
        });
    }

    // Filter: Needs Feedback
    if (filters.needsFeedback) {
        filteredData = filteredData.filter((post: any) => {
            return (feedbackCounts[post.id] || 0) === 0;
        });
    }

    // B. Fetch Resonances
    let resonanceCounts: Record<string, number> = {};
    let myResonances: Set<string> = new Set();

    if (processIds.length > 0) {
        const { data: res } = await supabase
            .from('resonances')
            .select('process_id, user_id')
            .in('process_id', processIds);

        res?.forEach((r: any) => {
            resonanceCounts[r.process_id] = (resonanceCounts[r.process_id] || 0) + 1;
            if (user && r.user_id === user.id) {
                myResonances.add(r.process_id);
            }
        });
    }

    // 5. Merge Data
    const enrichedData = filteredData.map((post: any) => ({
        ...post,
        hasResonated: myResonances.has(post.id),
        resonanceCount: resonanceCounts[post.id] || 0,
        feedbackCount: feedbackCounts[post.id] || 0
    }));

    return enrichedData;
}

export async function getDiscoveryFeed(currentUserState?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Base query: Published & Public
    let query = supabase
        .from('processes')
        .select(`
            id,
            title,
            phase,
            media_url,
            media_type,
            created_at,
            profiles!inner (
                username,
                current_state
            )
        `)
        .eq('status', 'published')
        .eq('visibility', 'public')
        // Ensure we only get posts where author state is DIFFERENT from current user
        .neq('profiles.current_state', currentUserState || 'Resting');

    // If logged in, exclude own posts
    if (user) {
        query = query.neq('user_id', user.id);
    }

    // Fetch a batch to shuffle
    query = query.order('created_at', { ascending: false }).limit(50);

    const { data, error } = await query;

    if (error || !data || data.length === 0) return [];

    // Deterministic Shuffle based on Date
    const today = new Date().toDateString(); // "Mon Dec 15 2025"

    // Simple seeded random function
    const seededRandom = (seed: string) => {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }
        const x = Math.sin(hash) * 10000;
        return x - Math.floor(x);
    };

    // Shuffle
    const shuffled = [...data].sort((a, b) => {
        const seedA = today + a.id;
        const seedB = today + b.id;
        return seededRandom(seedA) - seededRandom(seedB);
    });

    // Take top 3
    return shuffled.slice(0, 3);
}
