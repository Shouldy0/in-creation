'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';
import ResonanceButton from '../process/ResonanceButton';

interface ProcessCardProps {
    process: {
        id: string;
        title: string;
        description: string;
        phase: string;
        media_url?: string;
        media_type?: string;
        hasResonated: boolean;
        resonanceCount: number;
        profiles: {
            username: string;
            avatar_url?: string;
        }
    };
    currentUserId?: string;
}

export default function ProcessCard({ process, currentUserId }: ProcessCardProps) {
    return (
        <Link href={`/process/${process.id}`} className="block group animate-fade">
            <article className="p-0 md:p-4 -mx-4 md:mx-0 rounded-xl hover:bg-ink/30 transition-all duration-200">
                {/* Header: Author + Phase (Minimal) */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-paper flex items-center justify-center text-[10px] overflow-hidden border border-ink">
                            {process.profiles?.avatar_url ? (
                                <img src={process.profiles.avatar_url} alt={process.profiles?.username} className="w-full h-full object-cover" />
                            ) : (
                                (process.profiles?.username || '?')[0].toUpperCase()
                            )}
                        </div>
                        <p className="text-xs font-medium text-stone uppercase tracking-wide group-hover:text-foreground transition-colors">{process.profiles?.username || 'Unknown'}</p>
                    </div>
                    <span className="text-[10px] text-stone/60">
                        {process.phase}
                    </span>
                </div>

                {/* Body: Title + Desc */}
                <div className="space-y-2 mb-4">
                    <h3 className="text-2xl font-serif text-foreground group-hover:text-foreground/90 transition-colors leading-tight">
                        {process.title}
                    </h3>
                    <p className="text-stone text-base leading-relaxed line-clamp-3 font-light group-hover:text-stone/80 transition-colors">
                        {process.description}
                    </p>
                </div>

                {/* Footer: Media Icon & Action */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4 text-xs text-stone/70">
                        {process.media_type === 'audio' && (
                            <div className="flex items-center gap-1.5">
                                <Play size={10} className="fill-current" />
                                <span>Audio Note</span>
                            </div>
                        )}
                        {/* Time could go here */}
                    </div>

                    {/* Resonance (Prevent Default Link click) */}
                    <div onClick={(e) => e.preventDefault()}>
                        <ResonanceButton
                            processId={process.id}
                            initialHasResonated={process.hasResonated}
                            initialCount={process.resonanceCount}
                            currentUserId={currentUserId}
                        />
                    </div>
                </div>
            </article>
        </Link>
    );
}
