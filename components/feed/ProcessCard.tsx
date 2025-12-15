'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';
import ResonanceButton from '../process/ResonanceButton';

export default function ProcessCard({ process, currentUserId, variant = 'default' }: { process: any, currentUserId?: string, variant?: 'default' | 'compact' }) {
    const isCompact = variant === 'compact';

    return (
        <Link href={`/process/${process.id}`} className="block group animate-fade">
            <article className={`
                transition-all duration-300
                ${isCompact ? 'p-3 rounded-lg border border-stone/10 hover:border-stone/30 bg-paper' : 'p-0 md:p-6 -mx-4 md:mx-0 rounded-xl hover:bg-ink/30'}
            `}>
                {/* Header: Author + Phase */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-paper flex items-center justify-center text-[9px] overflow-hidden border border-ink">
                            {process.profiles?.avatar_url ? (
                                <img src={process.profiles.avatar_url} alt={process.profiles?.username} className="w-full h-full object-cover" />
                            ) : (
                                (process.profiles?.username || '?')[0].toUpperCase()
                            )}
                        </div>
                        <p className="text-[11px] font-medium text-stone uppercase tracking-wider group-hover:text-foreground transition-colors">
                            {process.profiles?.username || 'Unknown'}
                        </p>
                    </div>
                    <span className="text-[9px] text-stone/50 uppercase tracking-widest">
                        {process.phase}
                    </span>
                </div>

                {/* Body: Title + Desc */}
                <div className={`space-y-1 mb-3 ${isCompact ? '' : 'pl-7'}`}>
                    <h3 className={`font-serif text-foreground group-hover:underline decoration-stone/30 underline-offset-4 ${isCompact ? 'text-base leading-tight' : 'text-2xl leading-tight'}`}>
                        {process.title}
                    </h3>
                    {!isCompact && (
                        <p className="text-stone text-sm leading-relaxed line-clamp-2 font-light mt-1">
                            {process.description}
                        </p>
                    )}
                </div>

                {/* Footer: Resonance Text (Only if resonated) */}
                <div className={`flex items-center justify-between ${isCompact ? '' : 'pl-7'}`}>
                    {/* Media Indicator */}
                    <div className="flex items-center gap-2 text-[10px] text-stone/60">
                        {process.media_type && (
                            <span className="flex items-center gap-1">
                                {process.media_type === 'audio' ? 'Audio' : 'Visual'}
                            </span>
                        )}
                    </div>

                    {/* Resonance (Prevent Default Link click) */}
                    {!isCompact && (
                        <div onClick={(e) => e.preventDefault()}>
                            <ResonanceButton
                                processId={process.id}
                                initialHasResonated={process.hasResonated}
                                initialCount={process.resonanceCount}
                                currentUserId={currentUserId}
                            />
                        </div>
                    )}

                    {/* Resonance Text Only */}
                    {isCompact && process.hasResonated && (
                        <span className="text-[10px] text-accent italic font-serif">
                            Ha risuonato
                        </span>
                    )}
                </div>
            </article>
        </Link>
    );
}
