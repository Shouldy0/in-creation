'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

type ProfileData = {
    username: string;
    bio: string;
    disciplines: string[];
    current_state: 'Idea' | 'Blocked' | 'Flow' | 'Revision' | 'Resting';
};

const DISCIPLINES_LIST = [
    'Visual Art', 'Writing', 'Music', 'Code', 'Design', 'Film', 'Performance', 'Research'
];

const STATES_LIST = ['Idea', 'Blocked', 'Flow', 'Revision', 'Resting'];

export default function ProfileForm({ initialData }: { initialData?: any }) {
    const [formData, setFormData] = useState<ProfileData>({
        username: '',
        bio: '',
        disciplines: [],
        current_state: 'Resting',
        ...initialData // Override defaults if data exists
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    // const supabase = createClient(); // Moved inside handleSubmit

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const { error } = await supabase.from('profiles').upsert({
                id: user.id,
                ...formData,
                updated_at: new Date().toISOString(),
            });

            if (error) throw error;
            router.push('/feed');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    const toggleDiscipline = (d: string) => {
        setFormData(prev => ({
            ...prev,
            disciplines: prev.disciplines.includes(d)
                ? prev.disciplines.filter(item => item !== d)
                : [...prev.disciplines, d]
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-lg mx-auto">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-stone mb-1">Username</label>
                    <input
                        type="text"
                        required
                        pattern="[a-zA-Z0-9_-]+"
                        minLength={3}
                        className="w-full px-4 py-2 bg-ink border border-graphite rounded-md text-foreground focus:border-accent focus:outline-none"
                        value={formData.username}
                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone mb-1">Bio</label>
                    <textarea
                        className="w-full px-4 py-2 bg-ink border border-graphite rounded-md text-foreground focus:border-accent focus:outline-none h-24 resize-none"
                        placeholder="What are you exploring?"
                        value={formData.bio}
                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone mb-2">Disciplines</label>
                    <div className="flex flex-wrap gap-2">
                        {DISCIPLINES_LIST.map(d => (
                            <button
                                key={d}
                                type="button"
                                onClick={() => toggleDiscipline(d)}
                                className={`px-3 py-1 text-sm rounded-full border transition-colors ${formData.disciplines.includes(d)
                                    ? 'bg-foreground text-background border-foreground'
                                    : 'bg-transparent text-stone border-graphite hover:border-stone'
                                    }`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone mb-2">Current State</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {STATES_LIST.map(s => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setFormData({ ...formData, current_state: s as any })}
                                className={`px-2 py-1 text-xs sm:text-sm rounded border transition-colors ${formData.current_state === s
                                    ? 'border-accent text-accent'
                                    : 'border-graphite text-stone hover:border-stone'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-accent text-background font-medium rounded-md hover:bg-white transition-colors"
            >
                {loading ? 'Saving...' : 'Enter Studio'}
            </button>
        </form>
    );
}
