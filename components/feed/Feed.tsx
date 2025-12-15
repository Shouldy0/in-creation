'use client';

import { useState, useEffect } from 'react';
import { getFeed, FeedFilters } from '@/actions/feed';
import FilterPanel from './FilterPanel';
import ProcessCard from './ProcessCard';
import EmptyState from './EmptyState';
import { ProcessCardSkeleton } from '@/components/ui/Skeleton';


interface FeedProps {
    initialPosts: any[];
    discoveryPosts?: any[];
    thematicPaths?: any[];
    userCreativeState: string;
    currentUserId?: string;
}

export default function Feed({ initialPosts, discoveryPosts = [], thematicPaths = [], userCreativeState, currentUserId }: FeedProps) {
    const [posts, setPosts] = useState(initialPosts);
    const [filters, setFilters] = useState<FeedFilters>({
        disciplines: [],
        phases: [],
        needsFeedback: false
    });
    const [isFiltering, setIsFiltering] = useState(false);

    useEffect(() => {
        setPosts(initialPosts);
        setFilters({ disciplines: [], phases: [], needsFeedback: false });
    }, [initialPosts]);

    useEffect(() => {
        const fetchFiltered = async () => {
            // Optimization: If filters are all empty/false, and we have initialPosts, use them?
            const isEmptyFilters = filters.disciplines?.length === 0 && filters.phases?.length === 0 && !filters.needsFeedback;

            setIsFiltering(true);
            try {
                // Convert Set to Array if needed, but filters are arrays here.
                const data = await getFeed(filters);
                setPosts(data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setIsFiltering(false);
            }
        };

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
                            {/* EMPTY STATE DISCOVERY */}
                            {discoveryPosts.length > 0 && !isFiltering && (
                                <section className="py-8 animate-fade border-t border-stone/10">
                                    <div className="flex items-baseline justify-between mb-4 px-1">
                                        <h3 className="font-serif text-xl text-foreground">Scopri</h3>
                                        <span className="text-xs text-stone uppercase tracking-widest">Fuori dal tuo stato</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {discoveryPosts.map((dp: any) => (
                                            <ProcessCard key={dp.id} process={dp} variant="compact" currentUserId={currentUserId} />
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

                                // Inject Thematic Paths after Discovery (or after let's say 4th item if discovery shown, or just after 5th item)
                                // Let's put it at the very bottom or after index 4.
                                const showThematic = index === 4 && thematicPaths.length > 0 && !isFiltering;

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
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {discoveryPosts.map((dp: any) => (
                                                        <ProcessCard key={dp.id} process={dp} variant="compact" currentUserId={currentUserId} />
                                                    ))}
                                                </div>
                                                <div className="w-full h-px bg-gradient-to-r from-transparent via-stone/20 to-transparent mt-8"></div>
                                            </section>
                                        )}

                                        {showThematic && thematicPaths.map((path: any, idx: number) => (
                                            <section key={idx} className="py-8 animate-fade">
                                                <div className="mb-4 px-1">
                                                    <h3 className="font-serif text-xl text-foreground">{path.title}</h3>
                                                    <p className="text-xs text-stone mt-1">{path.description}</p>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {path.processes.map((p: any) => (
                                                        <ProcessCard key={p.id} process={p} variant="compact" currentUserId={currentUserId} />
                                                    ))}
                                                </div>
                                                <div className="w-full h-px bg-gradient-to-r from-transparent via-stone/20 to-transparent mt-8"></div>
                                            </section>
                                        ))}
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            )}
            {/* Fallback if list is short */}
            {posts.length < 5 && thematicPaths.length > 0 && !isFiltering && posts.length > 0 && (
                <div className="space-y-8">
                    {thematicPaths.map((path: any, idx: number) => (
                        <section key={idx} className="py-8 animate-fade border-t border-stone/10">
                            <div className="mb-4 px-1">
                                <h3 className="font-serif text-xl text-foreground">{path.title}</h3>
                                <p className="text-xs text-stone mt-1">{path.description}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {path.processes.map((p: any) => (
                                    <ProcessCard key={p.id} process={p} variant="compact" currentUserId={currentUserId} />
                                ))}
                            </div>
                        </section>
                    ))}
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
