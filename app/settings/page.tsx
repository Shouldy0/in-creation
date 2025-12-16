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

                <div className="border-t border-ink pt-8">
                    <h2 className="font-serif text-2xl text-foreground mb-4">Subscription</h2>
                    <div className="bg-secondary/20 p-6 rounded-xl border border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Current Plan</p>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-serif capitalize">{profile?.plan || 'Free'}</span>
                                {profile?.plan === 'pro' && (
                                    <span className="bg-foreground text-background text-xs px-2 py-0.5 rounded-full font-bold">PRO</span>
                                )}
                            </div>
                        </div>

                        {profile?.plan === 'pro' ? (
                            <form action={async () => {
                                'use server';
                                const { createCustomerPortal } = await import('@/actions/stripe');
                                const { url } = await createCustomerPortal();
                                if (url) {
                                    const { redirect } = await import('next/navigation');
                                    redirect(url);
                                }
                            }}>
                                <button type="submit" className="text-sm font-medium underline hover:text-foreground text-stone transition-colors">
                                    Manage Subscription
                                </button>
                            </form>
                        ) : (
                            <div className="text-right">
                                <p className="text-sm text-stone mb-2">Unlock Co-Process creation.</p>
                                {/* We could link to upgrade flow, or just let them discover it naturally at usage point as requested */}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
