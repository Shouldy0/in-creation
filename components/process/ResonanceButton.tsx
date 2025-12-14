'use client';

import { Sparkles, Heart } from 'lucide-react';
import { useOptimistic, useState, useTransition } from 'react';
import { toggleResonance } from '@/actions/resonance';

interface ResonanceButtonProps {
    processId: string;
    initialHasResonated: boolean;
    initialCount: number;
    currentUserId?: string;
    blockIndex?: number | null; // Optional block index
    minimal?: boolean; // For inline block usage
}

export default function ResonanceButton({
    processId,
    initialHasResonated,
    initialCount,
    currentUserId,
    blockIndex = null,
    minimal = false
}: ResonanceButtonProps) {
    const [state, setState] = useState({
        hasResonated: initialHasResonated,
        count: initialCount
    });

    const [optimisticState, addOptimistic] = useOptimistic(
        state,
        (currentState, newHasResonated: boolean) => {
            const delta = newHasResonated ? 1 : -1;
            return {
                hasResonated: newHasResonated,
                count: currentState.count + delta
            };
        }
    );

    const [isPending, startTransition] = useTransition();

    const handleToggle = async () => {
        if (!currentUserId) return; // Prevent interaction if not logged in (or show login modal)

        const newState = !optimisticState.hasResonated;

        // Optimistic UI update
        startTransition(async () => {
            addOptimistic(newState);
            // Server Action
            const result = await toggleResonance(processId, blockIndex);
            // Sync state
            setState(prev => ({
                hasResonated: result.hasResonated,
                count: prev.count + (result.hasResonated ? 1 : -1)
            }));
        });
    };

    const showLabel = optimisticState.count > 0;
    const Icon = minimal ? Heart : Sparkles;

    // Minimal classes
    const containerClass = minimal
        ? "flex items-center gap-1.5 cursor-pointer select-none transition-colors"
        : "group flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone/20 bg-paper hover:border-accent/40 transition-all cursor-pointer";

    const iconClass = minimal
        ? `w-4 h-4 transition-all duration-300 ${optimisticState.hasResonated ? 'fill-accent text-accent scale-110' : 'text-stone hover:text-accent'}`
        : `w-4 h-4 transition-all duration-300 ${optimisticState.hasResonated ? 'fill-accent text-accent scale-110' : 'text-stone group-hover:text-accent'}`;

    const textClass = minimal
        ? "text-[10px] uppercase tracking-widest text-accent font-medium"
        : `text-xs font-medium transition-colors ${optimisticState.hasResonated ? 'text-accent' : 'text-stone'}`;

    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggle();
            }}
            disabled={isPending || !currentUserId}
            className={containerClass}
            aria-label={optimisticState.hasResonated ? "Remove resonance" : "Add resonance"}
        >
            <Icon className={iconClass} />

            {/* Show Label if ANYONE resonated (count > 0) */}
            <span
                className={`${textClass} transition-opacity duration-300 ${showLabel ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden group-hover:w-auto group-hover:opacity-100'}`}
            >
                {showLabel && "Ha risuonato"}
            </span>
        </button>
    );
}
