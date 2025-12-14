'use client';

import { useEffect, useState } from 'react';
import { createDraftProcess } from '@/actions/process';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function NewProcessPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                const result = await createDraftProcess();
                if (!result.success) {
                    throw new Error(result.error);
                }
                router.push(`/process/${result.data}/edit`);
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Failed to create draft");
            }
        };
        init();
    }, [router]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center space-y-4">
                <h2 className="text-xl font-serif text-state-blocked">Unable to open studio</h2>
                <p className="text-stone font-mono text-sm bg-ink p-4 rounded border border-ink break-all max-w-md">
                    {error}
                </p>
                <button onClick={() => window.location.reload()} className="underline text-sm">Try Again</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-stone">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="animate-pulse">Preparing canvas...</p>
        </div>
    );
}
