import ProcessCard from '@/components/feed/ProcessCard';
import Link from 'next/link';

interface ProfileTimelineProps {
    processes: any[];
    isOwnProfile: boolean;
}

export default function ProfileTimeline({ processes, isOwnProfile }: ProfileTimelineProps) {
    if (!processes || processes.length === 0) {
        return (
            <div className="py-20 text-center space-y-4">
                <p className="font-serif text-xl text-stone italic">
                    The studio is quiet.
                </p>
                {isOwnProfile && (
                    <Link
                        href="/process/start"
                        className="inline-block text-sm text-foreground border-b border-foreground pb-0.5 hover:opacity-70 transition-opacity"
                    >
                        Start a new process
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xs font-mono text-stone uppercase tracking-widest text-center border-b border-stone/10 pb-4 mb-8">
                Timeline
            </h2>
            <div className="grid gap-8 max-w-xl mx-auto">
                {processes.map((process) => (
                    <div key={process.id} className="relative pl-8 border-l border-stone/10 pb-8 last:pb-0 last:border-0">
                        {/* Timeline Dot */}
                        <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-background border border-stone/30" />

                        {/* Using existing card but maybe we want a more compact version? 
                            For now, reusing ProcessCard is verified and safe. 
                            We simply wrap it. 
                        */}
                        <div className="transform transition-transform hover:translate-x-1 duration-300">
                            <ProcessCard process={process} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
