'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function AuthForm({ view = 'login' }: { view?: 'login' | 'signup' }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    // const supabase = createClient(); // Moved inside handleAuth

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const supabase = createClient();
            if (view === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                    },
                });
                if (error) throw error;
                // Ideally show check email message
                alert('Check your email for the confirmation link!');
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                if (data.user) {
                    router.push('/feed');
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleAuth} className="space-y-4 w-full max-w-sm mx-auto">
            <div className="space-y-2">
                <label className="text-sm font-medium text-stone">Email</label>
                <input
                    type="email"
                    required
                    className="w-full px-4 py-2 bg-ink border border-graphite rounded-md focus:outline-none focus:border-accent text-foreground placeholder-stone/50"
                    placeholder="artist@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-stone">Password</label>
                <input
                    type="password"
                    required
                    className="w-full px-4 py-2 bg-ink border border-graphite rounded-md focus:outline-none focus:border-accent text-foreground placeholder-stone/50"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            {error && <p className="text-state-blocked text-sm">{error}</p>}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-accent text-background font-medium rounded-md hover:bg-white transition-colors disabled:opacity-50"
            >
                {loading ? 'Processing...' : view === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
        </form>
    );
}
