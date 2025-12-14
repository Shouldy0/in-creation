'use client';

import { useState, useTransition } from 'react';
import { followUser, unfollowUser } from '@/actions/user';
import { Loader2 } from 'lucide-react';

interface FollowButtonProps {
    targetId: string;
    initialIsFollowing: boolean;
}

export default function FollowButton({ targetId, initialIsFollowing }: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isPending, startTransition] = useTransition();

    const toggleFollow = () => {
        const nextState = !isFollowing;
        setIsFollowing(nextState); // Optimistic update

        startTransition(async () => {
            try {
                if (nextState) {
                    await followUser(targetId);
                } else {
                    await unfollowUser(targetId);
                }
            } catch (error) {
                console.error("Follow action failed:", error);
                setIsFollowing(!nextState); // Revert on failure
            }
        });
    };

    return (
        <button
            onClick={toggleFollow}
            disabled={isPending}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${isFollowing
                ? 'bg-transparent border border-ink text-stone hover:border-stone hover:text-foreground'
                : 'bg-foreground text-background hover:opacity-90'
                }`}
        >
            {isPending ? (
                <Loader2 size={16} className="animate-spin" />
            ) : (
                isFollowing ? 'Seguito' : 'Segui'
            )}
        </button>
    );
}
