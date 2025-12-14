'use client';

import { useState, useEffect } from 'react';
import { searchUsers } from '@/actions/user';
import { Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import FollowButton from '../profile/FollowButton';
import { useRouter } from 'next/navigation';

export default function UserSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const performSearch = async () => {
            if (query.length < 2) {
                setResults([]);
                setIsOpen(false);
                return;
            }

            setIsLoading(true);
            setIsOpen(true);
            try {
                const data = await searchUsers(query);
                setResults(data);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(performSearch, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    return (
        <div className="relative w-full max-w-md mx-auto mb-8">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone w-4 h-4" />
                <input
                    type="text"
                    placeholder="Cerca artisti..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    className="w-full bg-paper border border-ink rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-stone/50 transition-colors"
                />
                {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-stone w-4 h-4 animate-spin" />
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div
                    className="absolute top-full left-0 w-full mt-2 bg-paper border border-ink rounded-lg shadow-xl overflow-hidden z-50 p-2 animate-in fade-in slide-in-from-top-1 duration-150"
                    onMouseLeave={() => setIsOpen(false)}
                >
                    {results.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-2 hover:bg-ink rounded-lg group transition-colors">
                            <Link href={`/profile/${user.id}`} className="flex items-center gap-3 flex-1">
                                <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-xs border border-graphite overflow-hidden">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} className="w-full h-full object-cover" />
                                    ) : user.username?.[0]}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-foreground">{user.username}</p>
                                    <div className="flex gap-1">
                                        {user.disciplines?.slice(0, 1).map((d: string) => (
                                            <span key={d} className="text-[10px] text-stone">{d}</span>
                                        ))}
                                    </div>
                                </div>
                            </Link>

                            {!user.isSelf && (
                                <div onClick={(e) => e.stopPropagation()}>
                                    <FollowButton targetId={user.id} initialIsFollowing={user.isFollowing} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            {isOpen && results.length === 0 && !isLoading && query.length >= 2 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-paper border border-ink rounded-lg shadow p-4 text-center text-xs text-stone animate-in fade-in slide-in-from-top-1 duration-150">
                    Nessun artista trovato.
                </div>
            )}
        </div>
    );
}
