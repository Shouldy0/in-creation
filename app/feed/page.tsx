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

    // Removed redirect for public access
    // if (!user) {
    //     redirect('/login');
    // }

    const { type } = await searchParams;
    const viewMode = (type === 'following' ? 'following' : 'state');

    // Get user's current state (if logged in)
    let userCreativeState = 'Resting';
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('current_state')
            .eq('id', user.id)
            .single();
        userCreativeState = profile?.current_state || 'Resting';
    }

    // If guest tries to access 'following' or 'profile', maybe redirect or show empty?
    // For now, let's allow 'state' view for guests.

    // Fetch feed data
    const initialPosts = await getFeed({
        type: viewMode,
        // If guest, we might want to pass explicit state filter if URL param supports it?
        // Currently getFeed uses userCreativeState for 'state' logic.
        // For guests, 'Resting' default is fine for now.
    });

    return (
        <main className="min-h-screen bg-background p-4 md:p-8 pb-20">
            <div className="max-w-2xl mx-auto space-y-8">
                <FeedHeader
                    currentState={userCreativeState}
                    viewMode={viewMode}
                    currentUserId={user?.id}
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
