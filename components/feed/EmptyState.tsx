import Link from 'next/link';
import { PenTool } from 'lucide-react';

export default function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
            <div className="w-16 h-16 rounded-full bg-ink flex items-center justify-center mb-6 text-stone">
                <PenTool size={24} />
            </div>
            <h3 className="text-xl font-serif text-foreground mb-2">
                No one has shared yet.
            </h3>
            <p className="text-stone mb-8 max-w-sm mx-auto">
                But someone will. Be the first to break the silence in this creative state.
            </p>
            <Link
                href="/process/start"
                className="bg-foreground text-background px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
            >
                Start a process
            </Link>
        </div>
    );
}
