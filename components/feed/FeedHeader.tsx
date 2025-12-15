'use client';

import { useState } from 'react';
import { updateCreativeState } from '@/actions/user';
import { ChevronDown, Loader2 } from 'lucide-react';

const CREATIVE_STATES = ['Idea', 'Blocked', 'Flow', 'Revision', 'Resting'];

// Imports updated
import Link from 'next/link';
import UserSearch from './UserSearch'; // Import

interface FeedHeaderProps {
    currentState: string;
    viewMode: 'state' | 'following';
    currentUserId?: string;
}

export default function FeedHeader({ currentState, viewMode, currentUserId }: FeedHeaderProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [optimisticState, setOptimisticState] = useState(currentState);

    const handleStateChange = async (newState: string) => {
        if (newState === optimisticState) {
            setIsMenuOpen(false);
            return;
        }

        setIsLoading(true);
        setOptimisticState(newState);
        setIsMenuOpen(false);
        try {
            await updateCreativeState(newState);
        } catch (error) {
            console.error('Failed to update state:', error);
            setOptimisticState(currentState);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <header className="mb-8 p-4 md:p-0 flex flex-col md:items-center gap-6">
            <h1 className="text-4xl md:text-5xl font-serif text-foreground text-center">Studio</h1>

            {/* Segmented Control */}
            <div className="flex bg-paper p-1.5 rounded-full border border-ink w-fit mx-auto relative">
                <Link
                    href="/feed?type=state"
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${viewMode === 'state'
                        ? 'bg-foreground text-background shadow-sm'
                        : 'text-stone hover:text-foreground'
                        }`}
                >
                    Scopri
                </Link>
                {currentUserId && (
                    <>
                        <Link
                            href="/co-process"
                            className="px-5 py-2 rounded-full text-sm font-medium text-stone hover:text-foreground transition-all"
                        >
                            Co-Process
                        </Link>

                        <Link
                            href="/feed?type=following"
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${viewMode === 'following'
                                ? 'bg-foreground text-background shadow-sm'
                                : 'text-stone hover:text-foreground'
                                }`}
                        >
                            Seguiti
                        </Link>

                        <Link
                            href={`/profile/${currentUserId}`}
                            className="px-5 py-2 rounded-full text-sm font-medium text-stone hover:text-foreground transition-all"
                        >
                            Profilo
                        </Link>

                        <div className="w-px bg-stone/20 my-1 mx-1"></div>

                        <Link
                            href="/process/start"
                            className="px-4 py-2 rounded-full text-sm font-medium text-accent hover:bg-accent/10 transition-colors flex items-center gap-1"
                        >
                            <span>+</span> New
                        </Link>
                    </>
                )}

                {!currentUserId && (
                    <Link
                        href="/login"
                        className="px-5 py-2 rounded-full text-sm font-medium text-accent hover:text-accent/80 transition-all border-l border-stone/20 ml-2"
                    >
                        Login
                    </Link>
                )}
            </div>

            {/* Create Action Removed from outside */}

            {/* User Search - Integrated */}
            <UserSearch />

            {viewMode === 'state' && (
                <div className="flex items-center justify-center gap-2 text-stone text-sm">
                    <span>Viewing:</span>
                    <div className="relative inline-block">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="font-medium text-foreground border-b border-stone/30 hover:border-foreground transition-all flex items-center gap-1"
                        >
                            {optimisticState} Mode
                            <ChevronDown size={14} />
                        </button>
                        {/* Dropdown (Simplified) */}
                        {isMenuOpen && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-paper border border-ink rounded-lg shadow-xl py-1 z-50 w-40 text-left">
                                {CREATIVE_STATES.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => handleStateChange(s)}
                                        className={`w-full px-4 py-2 hover:bg-ink text-sm ${s === optimisticState ? 'font-bold' : ''}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
