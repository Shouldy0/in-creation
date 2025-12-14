'use client';

import * as React from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    React.useEffect(() => {
        console.error('Global Error:', error);
    }, [error]);

    return (
        <html>
            <body className="bg-background text-foreground flex items-center justify-center min-h-screen">
                <div className="max-w-md p-8 bg-ink rounded-lg border border-graphite text-center space-y-4">
                    <h2 className="text-xl font-serif text-accent">Something went wrong!</h2>
                    <div className="text-left text-xs bg-black p-4 rounded text-red-400 overflow-auto max-h-48 font-mono">
                        {error.name}: {error.message}
                    </div>
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-foreground text-background rounded-full font-medium hover:bg-white/90 transition-colors"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
