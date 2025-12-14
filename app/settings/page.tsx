import { createClient } from '@/utils/supabase/server';
import ProfileForm from '@/components/profile/ProfileForm';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return (
        <main className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <header className="border-b border-ink pb-4">
                    <h1 className="font-serif text-3xl text-foreground">Studio Settings</h1>
                    <p className="text-stone">Manage your creative identity.</p>
                </header>

                <ProfileForm initialData={profile || {}} />
            </div>
        </main>
    );
}
