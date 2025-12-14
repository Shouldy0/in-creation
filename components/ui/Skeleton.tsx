export default function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-ink/50 rounded ${className}`} />
    );
}

export function ProcessCardSkeleton() {
    return (
        <div className="p-4 md:p-6 -mx-4 md:mx-0 rounded-xl space-y-4">
            <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="w-24 h-4" />
            </div>
            <div className="space-y-2">
                <Skeleton className="w-3/4 h-8" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-2/3 h-4" />
            </div>
        </div>
    );
}
