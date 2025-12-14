'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function NewProcessPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [successId, setSuccessId] = useState<string | null>(null);

    const [logs, setLogs] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    useEffect(() => {
        const createProcess = async () => {
            addLog("Starting creation sequence...");
            try {
                // Initialize Client-side Supabase
                const supabase = createBrowserClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );
                addLog("Supabase client initialized.");

                // 1. Get User AND Profile (Beta Check)
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError) throw userError;
                if (!user) {
                    router.push('/login');
                    return;
                }
                addLog(`User authenticated: ${user.id}`);

                // Check Beta Access
                const { data: profile } = await supabase.from('profiles').select('beta_access').eq('id', user.id).maybeSingle();

                if (!profile) {
                    addLog("Profile missing. Attempting creation...");
                } else if (!profile.beta_access) {
                    addLog("Beta access denied.");
                    setError("BETA_ACCESS_DENIED");
                    setLoading(false); // Stop loading to show error
                    return;
                } else {
                    addLog("Beta access confirmed.");
                }

                // 1.5 Ensure Profile Exists (Fix for FK Constraint)
                // Use maybeSingle to avoid 406 error if not found
                const { data: validationProfile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();

                if (!validationProfile) {
                    addLog("Creating missing profile...");
                    const { error: profileError } = await supabase.from('profiles').insert({
                        id: user.id,
                        username: user.email?.split('@')[0] || 'artist',
                        full_name: 'Artist',
                        avatar_url: user.user_metadata?.avatar_url
                    });
                    if (profileError) {
                        addLog(`Profile creation failed: ${profileError.message}`);
                        throw profileError;
                    }
                    addLog("Profile created.");
                }

                // 2. Insert Process (Directly from Client)
                addLog("Inserting new process draft...");
                const { data, error: insertError } = await supabase
                    .from('processes')
                    .insert({
                        user_id: user.id,
                        title: '',
                        description: '',
                        phase: 'Idea',
                        status: 'draft',
                        visibility: 'public'
                    })
                    .select()
                    .single();

                if (insertError) {
                    addLog(`Insert failed: ${insertError.message}`);
                    throw new Error(insertError.message);
                }

                if (!data) {
                    throw new Error("No data returned from insert");
                }

                addLog(`Success! ID: ${data.id}`);
                setSuccessId(data.id);

            } catch (err: any) {
                console.error("Client Creation Error:", err);
                setError(err.message || "Failed to create draft");
            }
        };

        if (!successId) createProcess();
    }, [router, successId]);

    if (successId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-stone space-y-6 animate-fade">
                <div className="w-12 h-12 rounded-full bg-ink flex items-center justify-center">
                    <span className="text-xl">✨</span>
                </div>
                <h2 className="text-xl font-serif text-foreground">Project Created</h2>

                <button
                    onClick={() => router.push(`/process/${successId}/edit`)}
                    className="px-6 py-3 bg-foreground text-background rounded-full font-bold hover:opacity-90 transition-opacity"
                >
                    Open Studio
                </button>
            </div>
        );
    }

    if (error === "BETA_ACCESS_DENIED") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center space-y-6">
                <h2 className="text-2xl font-serif text-amber-500">Access Restricted</h2>
                <p className="text-stone max-w-md">
                    IN-CREATION is currently opening slowly to beta users.
                    Your account does not have access yet.
                </p>
                <div className="bg-ink p-4 rounded text-left">
                    <p className="text-xs font-mono text-stone mb-1">USER ID:</p>
                    <p className="text-sm font-mono text-foreground break-all bg-paper p-1 rounded select-all">
                        {(logs.find(l => l.startsWith("User authenticated:"))?.split(": ")[1]) || "Unknown"}
                    </p>
                </div>
                <p className="text-stone text-sm">Please ask Daiana to enable beta access for this ID.</p>
                <button onClick={() => router.push('/feed')} className="text-stone underline text-sm hover:text-foreground">
                    Back to Feed
                </button>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center space-y-4">
                <h2 className="text-xl font-serif text-state-blocked">Unable to open studio</h2>
                <p className="text-stone font-mono text-sm bg-ink p-4 rounded border border-ink break-all max-w-md">
                    {error}
                </p>
                <div className="flex gap-4 justify-center">
                    <button onClick={() => window.location.reload()} className="underline text-sm">Try Again</button>
                    <button onClick={() => router.push('/feed')} className="underline text-sm text-stone">Back to Feed</button>
                </div>
                <div className="absolute bottom-10 left-0 w-full px-4 text-center">
                    <div className="text-xs font-mono text-stone/50 bg-ink p-2 rounded inline-block text-left max-h-32 overflow-auto">
                        {logs.map((l, i) => <div key={i}>{l}</div>)}
                    </div>
                </div>
                <p className="fixed bottom-2 right-2 text-xs text-stone opacity-50">v5.4 BETA-CHECK</p>
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
