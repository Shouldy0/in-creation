'use client';

import { useEffect, useState, use } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import ProcessEditor from '@/components/process/ProcessEditor';
import { Loader2 } from 'lucide-react';

export default function EditProcessPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params); // Unwrap params
    const [processData, setProcessData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProcess = async () => {

            // 0. Validate ID format
            if (!id || id === 'undefined' || id === 'null') {
                setError("BROKEN_LINK"); // Use a code to trigger specific UI
                setLoading(false);
                return;
            }

            try {
                const supabase = createBrowserClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );

                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push('/login');
                    return;
                }

                const { data, error } = await supabase
                    .from('processes')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    throw error;
                }
                if (!data) {
                    throw new Error("Process not found");
                }

                // Verify ownership (Client side check for UX, RLS handles security)
                if (data.user_id !== user.id) {
                    throw new Error("Unauthorized");
                }

                // Check Beta Access - REMOVED
                // const { data: profile } = await supabase.from('profiles').select('beta_access').eq('id', user.id).single();
                // if (!profile?.beta_access) {
                //     router.push('/feed');
                //     return;
                // }

                setProcessData(data);
            } catch (err: any) {
                console.error("Fetch Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProcess();
    }, [id, router]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-stone">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Loading Studio...</p>
            </div>
        );
    }

    if (error === "BROKEN_LINK") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center space-y-6">
                <h2 className="text-2xl font-bold text-red-500">Broken Link Detected</h2>
                <p className="text-stone max-w-md">
                    You are trying to edit a project that doesn't exist (ID is "undefined").
                </p>
                <button
                    onClick={() => router.push('/process/start')}
                    className="px-8 py-4 bg-foreground text-background rounded-full font-bold text-lg hover:scale-105 transition-transform"
                >
                    Create New Project ➔
                </button>
                <p className="text-xs opacity-50">v5.2 RESCUE</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center space-y-4">
                <h2 className="text-xl font-bold text-red-500">Could not load project</h2>
                <p className="font-mono text-sm bg-ink p-4 rounded">{error}</p>
                <button onClick={() => window.location.reload()} className="underline text-sm">Retry</button>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background p-4 md:p-8 relative">
            {/* System Status Dashboard (Temporary for Debugging) */}
            {/* System Status Dashboard Removed for Clean UI */}

            <ProcessEditor process={processData} />
        </main>
    );
}
