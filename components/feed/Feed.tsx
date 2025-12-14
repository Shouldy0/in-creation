'use client';

import { useState, useEffect } from 'react';
import { getFeed, FeedFilters } from '@/actions/feed';
import FeedHeader from './FeedHeader';
import FilterPanel from './FilterPanel';
import ProcessCard from './ProcessCard';
import EmptyState from './EmptyState';

interface FeedProps {
    initialPosts: any[];
    userCreativeState: string;
}

export default function Feed({ initialPosts, userCreativeState }: FeedProps) {
    const [posts, setPosts] = useState(initialPosts);
    const [filters, setFilters] = useState<FeedFilters>({
        disciplines: [],
        phases: [],
        needsFeedback: false
    });
    const [isFiltering, setIsFiltering] = useState(false);

    // If initialPosts change (e.g. revalidation from server after state change), update local state
    useEffect(() => {
        setPosts(initialPosts);
        // Reset filters on state change? Maybe better to keep them?
        // Let's reset to avoid confusion as contexts change heavily
        setFilters({ disciplines: [], phases: [], needsFeedback: false });
    }, [initialPosts]);

    // Handle Filter Changes
    useEffect(() => {
        // Skip first render if we want to rely on initialPosts, but actually 
        // initialPosts corresponds to empty filters.
        // So only fetch if filters are NOT empty OR if we need to refresh.
        // A simple equality check or just ALWAYS fetch when filters change (debounced?)

        // Actually, let's just fetch when filters change.
        // If filters are empty, we can revert to initialPosts to save a call IF initialPosts is fresh.
        // But for simplicity, let's just fetch.

        const fetchFiltered = async () => {
            // Avoid double fetch on mount if filters are default
            // But we need to detect if this is mount.
            // We can just rely on `isFiltering` flag to show loading state.

            // Optimization: If filters are all empty/false, and we have initialPosts, use them?
            const isEmptyFilters = filters.disciplines?.length === 0 && filters.phases?.length === 0 && !filters.needsFeedback;

            if (isEmptyFilters && initialPosts) {
                // Optimization: Revert to initial passed data if compatible? 
                // Actually, let's NOT assume initialPosts are still fresh if user has been navigating.
                // But for MVP, let's try to avoid aggressive over-fetching.
            }

            setIsFiltering(true);
            try {
                const data = await getFeed(filters);
                setPosts(data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setIsFiltering(false);
            }
        };

        // Debounce could be good here
        const timeoutId = setTimeout(fetchFiltered, 300);
        return () => clearTimeout(timeoutId);

    }, [filters]);

    return (
        <div className="space-y-6">
            <FeedHeader currentState={userCreativeState} />

            <FilterPanel
                filters={filters}
                onFilterChange={setFilters}
            />

            <div className={`transition-opacity duration-300 ${isFiltering ? 'opacity-50' : 'opacity-100'}`}>
                {posts.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid gap-6">
                        {posts.map(post => (
                            <ProcessCard key={post.id} process={post} />
                        ))}
                    </div>
                )}
            </div>

            {posts.length > 0 && (
                <p className="text-center text-stone text-sm py-8 italic">
                    You're all caught up.
                </p>
            )}
        </div>
    );
}
