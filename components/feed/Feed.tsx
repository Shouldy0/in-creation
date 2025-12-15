'use client';

import { useState, useEffect } from 'react';
import { getFeed, FeedFilters } from '@/actions/feed';
import FilterPanel from './FilterPanel';
import ProcessCard from './ProcessCard';
import EmptyState from './EmptyState';
import { ProcessCardSkeleton } from '@/components/ui/Skeleton';

import DiscoveryCard from './DiscoveryCard';

interface FeedProps {
    initialPosts: any[];
    discoveryPosts?: any[];
    userCreativeState: string;
    currentUserId?: string;
}

export default function Feed({ initialPosts, discoveryPosts = [], userCreativeState, currentUserId }: FeedProps) {
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
            <FilterPanel
                filters={filters}
                onFilterChange={setFilters}
            />

            {isFiltering ? (
                <div className="space-y-6 animate-fade">
                    <ProcessCardSkeleton />
                    <ProcessCardSkeleton />
                </div>
            ) : (
                <div className="animate-fade space-y-6">
                    {posts.length === 0 ? (
                        <div className="space-y-12">
                            <EmptyState />
                            {discoveryPosts.length > 0 && !isFiltering && (
                                <section className="py-8 animate-fade border-t border-stone/10">
                                    <div className="flex items-baseline justify-between mb-4 px-1">
                                        <h3 className="font-serif text-xl text-foreground">Scopri</h3>
                                        <span className="text-xs text-stone uppercase tracking-widest">Fuori dal tuo stato</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {discoveryPosts.map((dp: any) => (
                                            <DiscoveryCard key={dp.id} process={dp} />
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    ) : (
                        <>
                            {posts.map((post, index) => {
                                // Inject Discovery after 3rd item (index 2)
                                const showDiscovery = index === 2 && discoveryPosts.length > 0 && !isFiltering && filters.disciplines?.length === 0 && filters.phases?.length === 0;

                                return (
                                    <div key={post.id} className="space-y-6">
                                        <ProcessCard
                                            process={post}
                                            currentUserId={currentUserId}
                                        />

                                        {showDiscovery && (
                                            <section className="py-8 animate-fade">
                                                <div className="flex items-baseline justify-between mb-4 px-1">
                                                    <h3 className="font-serif text-xl text-foreground">Scopri</h3>
                                                    <span className="text-xs text-stone uppercase tracking-widest">Fuori dal tuo stato</span>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                    {discoveryPosts.map((dp: any) => (
                                                        <DiscoveryCard key={dp.id} process={dp} />
                                                    ))}
                                                </div>

                                                {/* Divider after section */}
                                                <div className="w-full h-px bg-gradient-to-r from-transparent via-stone/20 to-transparent mt-8"></div>
                                            </section>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Fallback: If less than 3 items, show Discovery at bottom? 
                                User said "After N items or when feed is empty".
                                If Feed is Empty, we show EmptyState. 
                                Let's modify EmptyState to showing Discovery if available? 
                                Or just append at bottom if list < 3.
                            */}
                            {posts.length < 3 && discoveryPosts.length > 0 && !isFiltering && (
                                <section className="py-8 animate-fade">
                                    <div className="flex items-baseline justify-between mb-4 px-1">
                                        <h3 className="font-serif text-xl text-foreground">Scopri</h3>
                                        <span className="text-xs text-stone uppercase tracking-widest">Fuori dal tuo stato</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {discoveryPosts.map((dp: any) => (
                                            <DiscoveryCard key={dp.id} process={dp} />
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    )}
                </div>
            )}

            {posts.length > 0 && !isFiltering && (
                <p className="text-center text-stone text-sm py-8 italic">
                    Tutto letto. Sei al passo.
                </p>
            )}
        </div>
    );
}
