import Link from 'next/link';
import { formatDate } from '@/utils/format';

interface CoProcessCardProps {
    id: string;
    title: string;
    description?: string | null;
    status: 'active' | 'archived';
    memberCount: number;
    lastActive: string;
}

export default function CoProcessCard({ id, title, description, status, memberCount, lastActive }: CoProcessCardProps) {
    return (
        <Link href={`/co-process/${id}`} className="block group">
            <div className="p-6 rounded-xl bg-secondary/50 border border-border hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-serif font-medium text-foreground group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-zinc-500/10 text-zinc-500'}`}>
                        {status}
                    </span>
                </div>

                {description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {description}
                    </p>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
                    <div className="flex items-center gap-2">
                        <span>{memberCount} members</span>
                    </div>
                    <span>Updated {formatDate(lastActive)}</span>
                </div>
            </div>
        </Link>
    );
}
