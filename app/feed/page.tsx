import Feed from '@/components/feed/Feed';
import { createClient } from '@/utils/supabase/server';
import { getFeed } from '@/actions/feed';
import { redirect } from 'next/navigation';
import BetaLockScreen from '@/components/beta/BetaLockScreen';

export default async function FeedPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Get user's current state and beta access
    const { data: profile } = await supabase
        .from('profiles')
        .select('current_state, beta_access')
        .eq('id', user.id)
        .single();

    // Check Beta Access
    if (!profile?.beta_access) {
        return <BetaLockScreen />;
    }

    // Default to 'Resting' or handle error
    const userCreativeState = profile?.current_state || 'Resting';

    // Fetch initial feed data (no filters)
    // The getFeed action handles the state matching internally based on the user
    // We just pass empty filters
    const initialPosts = await getFeed({});

    return (
        <main className="min-h-screen bg-background p-4 md:p-8 pb-20">
            <div className="max-w-2xl mx-auto">
                <Feed
                    initialPosts={initialPosts}
                    userCreativeState={userCreativeState}
                />
            </div>
        </main>
    );
}
