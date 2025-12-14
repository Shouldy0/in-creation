'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background text-foreground p-8 text-center">
            <h2 className="text-2xl font-serif">Something went wrong.</h2>
            <div className="bg-red-500/10 p-4 rounded border border-red-500/20 max-w-md mx-auto">
                <p className="text-stone text-sm font-mono break-all">{error.message}</p>
                {error.digest && <p className="text-xs text-stone mt-2">Digest: {error.digest}</p>}
            </div>
            <button
                onClick={reset}
                className="px-4 py-2 bg-foreground text-background rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
                Try again
            </button>
        </div>
    );
}
