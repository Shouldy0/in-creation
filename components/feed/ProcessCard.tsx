import Link from 'next/link';
import { Play } from 'lucide-react';

interface ProcessCardProps {
    process: {
        id: string;
        title: string;
        description: string;
        phase: string;
        media_url?: string;
        media_type?: string;
        profiles: {
            username: string;
            avatar_url?: string;
        }
    }
}

export default function ProcessCard({ process }: ProcessCardProps) {
    return (
        <Link href={`/process/${process.id}`} className="block group">
            <article className="bg-ink p-6 rounded-lg border border-transparent group-hover:border-graphite transition-all">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-paper flex items-center justify-center text-xs overflow-hidden">
                            {process.profiles.avatar_url ? (
                                <img src={process.profiles.avatar_url} alt={process.profiles.username} className="w-full h-full object-cover" />
                            ) : (
                                process.profiles.username[0]
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">{process.profiles.username}</p>
                            <span className="text-xs text-stone bg-paper px-2 py-0.5 rounded border border-graphite inline-block mt-1">
                                {process.phase}
                            </span>
                        </div>
                    </div>
                </div>

                <h3 className="text-xl font-serif text-foreground mb-2 group-hover:text-accent transition-colors">
                    {process.title}
                </h3>
                <p className="text-stone line-clamp-2 mb-4 text-sm leading-relaxed">
                    {process.description}
                </p>

                <div className="flex items-center gap-2 mt-4 text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    Open process <span>→</span>
                </div>

                {process.media_type === 'audio' && (
                    <div className="mt-3 flex items-center gap-2 text-stone text-xs">
                        <Play size={12} className="fill-current" />
                        <span>Audio attached</span>
                    </div>
                )}
            </article>
        </Link>
    );
}
