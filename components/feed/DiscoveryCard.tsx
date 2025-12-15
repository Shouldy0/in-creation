'use client';

import Link from 'next/link';

interface DiscoveryCardProps {
    process: {
        id: string;
        title: string;
        phase: string;
        media_url?: string;
        media_type?: string;
        profiles: {
            username: string;
            current_state: string;
        };
    };
}

export default function DiscoveryCard({ process }: DiscoveryCardProps) {
    return (
        <Link href={`/process/${process.id}`} className="block group">
            <div className="bg-ink border border-stone/10 rounded-lg overflow-hidden transition-all hover:border-stone/30 hover:bg-paper relative">
                <div className="p-4 flex gap-4 h-full">
                    {/* Media Thumbnail (Square-ish) */}
                    {process.media_url ? (
                        <div className="w-20 h-20 shrink-0 bg-black/20 rounded-md overflow-hidden relative border border-stone/5">
                            {process.media_type === 'image' ? (
                                <img
                                    src={process.media_url}
                                    alt={process.title}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone/50 bg-stone/5">
                                    <span className="text-xs">Audio</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-20 h-20 shrink-0 bg-stone/5 rounded-md border border-stone/5 flex items-center justify-center">
                            <span className="text-xs text-stone/30 font-serif italic">Text</span>
                        </div>
                    )}

                    {/* Text Content */}
                    <div className="flex flex-col justify-center min-w-0">
                        <span className="text-[10px] uppercase tracking-widest text-stone mb-1 block">
                            {process.profiles?.current_state || 'Unknown'}
                        </span>
                        <h4 className="font-serif text-foreground text-lg leading-tight truncate pr-2 group-hover:underline decoration-stone/30 underline-offset-4">
                            {process.title}
                        </h4>
                        <p className="text-sm text-stone mt-1 truncate">
                            by {process.profiles?.username || 'Unknown'}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}
