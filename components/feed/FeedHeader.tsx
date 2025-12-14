'use client';

import { useState } from 'react';
import { updateCreativeState } from '@/actions/user';
import { ChevronDown, Loader2 } from 'lucide-react';

const CREATIVE_STATES = ['Idea', 'Blocked', 'Flow', 'Revision', 'Resting'];

interface FeedHeaderProps {
    currentState: string;
}

export default function FeedHeader({ currentState }: FeedHeaderProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // Optimistic UI state
    const [optimisticState, setOptimisticState] = useState(currentState);

    const handleStateChange = async (newState: string) => {
        if (newState === optimisticState) {
            setIsMenuOpen(false);
            return;
        }

        setIsLoading(true);
        setOptimisticState(newState); // Optimistic update
        setIsMenuOpen(false);
        try {
            await updateCreativeState(newState);
        } catch (error) {
            console.error('Failed to update state:', error);
            setOptimisticState(currentState); // Revert
            // Could add toast here
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-4">
                Studio Feed
            </h1>
            <div className="flex items-center gap-3 text-lg md:text-xl text-stone">
                <span>You are currently in</span>
                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        disabled={isLoading}
                        className="flex items-center gap-2 font-medium text-foreground border-b border-foreground/30 hover:border-foreground pb-0.5 transition-all"
                    >
                        {optimisticState}
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
                    </button>

                    {isMenuOpen && (
                        <div className="absolute top-full left-0 mt-2 bg-paper border border-ink rounded shadow-xl py-1 z-50 w-48 min-w-[150px]">
                            {CREATIVE_STATES.map(s => (
                                <button
                                    key={s}
                                    onClick={() => handleStateChange(s)}
                                    className={`w-full text-left px-4 py-2 hover:bg-ink transition-colors flex items-center justify-between ${s === optimisticState ? 'text-foreground font-medium' : 'text-stone'
                                        }`}
                                >
                                    {s}
                                    {s === optimisticState && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <span>mode.</span>
            </div>
            <p className="text-sm text-stone/60 mt-2">
                Showing others in the same headspace.
            </p>
        </header>
    );
}
