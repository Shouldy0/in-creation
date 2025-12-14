'use client';

import { useState } from 'react';
import FollowButton from './FollowButton';
import StartConversationButton from '@/components/messaging/StartConversationButton';
import { blockUser } from '@/actions/moderation';
import Link from 'next/link';

interface ProfileHeaderProps {
    profile: any;
    currentUser: any;
    isFollowing: boolean;
}

export default function ProfileHeader({ profile, currentUser, isFollowing }: ProfileHeaderProps) {
    const isOwnProfile = currentUser?.id === profile.id;

    return (
        <header className="text-center space-y-6 animate-fade">
            {/* Avatar */}
            <div className="relative w-24 h-24 mx-auto">
                <div className="w-full h-full rounded-full overflow-hidden bg-paper flex items-center justify-center text-4xl border border-stone/10">
                    {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                    ) : (
                        <span className="font-serif text-stone/50">{profile.username?.[0]?.toUpperCase()}</span>
                    )}
                </div>
            </div>

            {/* Identity */}
            <div className="space-y-2">
                <h1 className="font-serif text-4xl text-foreground tracking-tight">{profile.username}</h1>
                {profile.bio && (
                    <p className="text-stone max-w-lg mx-auto text-lg leading-relaxed font-serif italic opacity-80">
                        {profile.bio}
                    </p>
                )}
            </div>

            {/* Disciplines - Editorial Text List */}
            {profile.disciplines && profile.disciplines.length > 0 && (
                <div className="flex justify-center gap-2 text-xs font-mono text-stone tracking-widest uppercase">
                    {profile.disciplines.join(' • ')}
                </div>
            )}

            {/* Current State Badge */}
            <div className="flex justify-center">
                <div className="px-3 py-1 rounded-full bg-ink/50 text-stone text-xs border border-stone/10 font-medium">
                    Currently in {profile.current_state || 'Resting'} Mode
                </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex justify-center gap-6 items-center">
                {isOwnProfile ? (
                    <Link
                        href="/settings"
                        className="text-sm border-b border-stone text-stone hover:text-foreground hover:border-foreground transition-colors pb-0.5"
                    >
                        Edit Profile
                    </Link>
                ) : (
                    currentUser && (
                        <>
                            <FollowButton
                                targetId={profile.id}
                                initialIsFollowing={isFollowing}
                            />

                            <StartConversationButton
                                participantId={profile.id}
                                contextType="profile"
                                label="Message"
                                className="px-4 py-1.5 rounded-full border border-stone/20 text-stone text-sm hover:text-foreground hover:border-foreground transition-colors"
                            />

                            {/* Block User - Subtle/Hidden */}
                            <form action={async () => {
                                await blockUser(currentUser.id, profile.id);
                            }}>
                                <button className="text-xs text-stone/30 hover:text-red-500 transition-colors">
                                    Block
                                </button>
                            </form>
                        </>
                    )
                )}
            </div>
        </header>
    );
}
