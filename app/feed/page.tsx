import Feed from '@/components/feed/Feed';
import FeedHeader from '@/components/feed/FeedHeader';
import UserSearch from '@/components/feed/UserSearch'; // Import
import { createClient } from '@/utils/supabase/server';
import { getFeed } from '@/actions/feed';
import { redirect } from 'next/navigation';
import BetaLockScreen from '@/components/beta/BetaLockScreen';

export const dynamic = 'force-dynamic';

export default async function FeedPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { type } = await searchParams; // Unwrap for Next 15/16
    const viewMode = (type === 'following' ? 'following' : 'state');

    // Get user's current state and beta access
    const { data: profile } = await supabase
        .from('profiles')
        .select('current_state, beta_access')
        .eq('id', user.id)
        .single();

    // Check Beta Access - REMOVED
    // if (!profile?.beta_access) {
    //     return <BetaLockScreen />;
    // }

    // Default to 'Resting' or handle error
    const userCreativeState = profile?.current_state || 'Resting';

    // Fetch feed data
    const initialPosts = await getFeed({
        type: viewMode
    });

    return (
        <main className="min-h-screen bg-background p-4 md:p-8 pb-20">
            <div className="max-w-2xl mx-auto space-y-8">
                <FeedHeader
                    currentState={userCreativeState}
                    viewMode={viewMode}
                    currentUserId={user.id}
                />

                <Feed
                    initialPosts={initialPosts}
                    userCreativeState={userCreativeState}
                    currentUserId={user.id}
                />
            </div>
        </main>
    );
}
