'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useState } from 'react';

export default function TestDbPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const [createdId, setCreatedId] = useState<string | null>(null);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    const runTest = async () => {
        setLogs([]);
        addLog('Starting Test...');

        try {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            addLog('Supabase Client created.');

            // 1. Check Auth
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError) throw authError;
            if (!user) {
                addLog('❌ User NOT logged in. Redirecting to login...');
                return;
            }
            addLog(`✅ User detected: ${user.email} (${user.id})`);

            // 2. Check Profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError) {
                addLog(`⚠️ Profile fetch failed: ${profileError.message}`);
                // Try create?
            } else {
                addLog('✅ Profile found.');
            }

            // 3. Try Insert Process
            addLog('Attempting specific Process Insert...');
            const { data: proc, error: procError } = await supabase
                .from('processes')
                .insert({
                    user_id: user.id,
                    title: 'Test Process ' + Math.floor(Math.random() * 1000),
                    description: 'Test description',
                    phase: 'Idea',
                    status: 'draft',
                    visibility: 'public'
                })
                .select()
                .single();

            if (procError) {
                addLog(`❌ Process Insert FAILED: ${procError.message} (${procError.code})`);
                addLog(`Hint: Check RLS policies for table 'processes'.`);
            } else {
                addLog(`✅ Process Insert SUCCESS! ID: ${proc.id}`);
                setCreatedId(proc.id); // Save ID
            }

        } catch (err: any) {
            addLog(`💥 CRITICAL ERROR: ${err.message}`);
        }
    };

    return (
        <div className="p-8 font-mono text-sm bg-background text-foreground min-h-screen">
            <h1 className="text-xl font-bold mb-4">Emergency Creator (Debug Mode)</h1>
            <p className="mb-4 text-stone">If the main button doesn't work, use this.</p>

            {!createdId ? (
                <button
                    onClick={runTest}
                    className="bg-accent text-white px-4 py-2 rounded mb-8 hover:opacity-90"
                >
                    Create New Project & Diagnostic
                </button>
            ) : (
                <div className="mb-8 p-4 bg-green-500/10 border border-green-500 rounded">
                    <p className="font-bold text-green-600 mb-2">Project Created Successfully!</p>
                    <a href={`/process/${createdId}/edit`} className="underline text-lg font-bold">
                        👉 CLICK HERE TO OPEN EDITOR
                    </a>
                </div>
            )}

            <div className="bg-ink p-4 rounded border border-stone/20 space-y-1">
                {logs.map((log, i) => (
                    <div key={i} className={log.includes('❌') || log.includes('💥') ? 'text-red-500 font-bold' : log.includes('✅') ? 'text-green-500' : 'text-stone'}>
                        {log}
                    </div>
                ))}
            </div>
        </div>
    );
}
