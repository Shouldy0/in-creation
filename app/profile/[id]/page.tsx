import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTimeline from '@/components/profile/ProfileTimeline';
import { getFollowStatus } from '@/actions/user';

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Unwrap params for Next.js 16 compat
    const { id } = await params;

    // Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

    if (!profile) {
        if (user && user.id === id) {
            return redirect('/settings'); // Redirect to settings if profile incomplete
        }
        return notFound();
    }

    // Verify Beta Access for Visitor
    // (If visitor has no beta access, they can't see profiles? Or just Feed?
    // Let's assume Profile is viewable if they have link, for MVP social growth testing.
    // But strict MVP says "Core features". Let's leave open for now, beta gate is on Feed.)

    // Fetch Public Processes
    const { data: processes } = await supabase
        .from('processes')
        .select(`
            *,
            profiles (
                username,
                avatar_url
            )
        `)
        .eq('user_id', id)
        .eq('status', 'published')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

    const isOwnProfile = user?.id === profile.id;

    // Fetch Follow Status (Parallelize with Promise.all if needed, simple here)
    const isFollowing = user && !isOwnProfile ? await getFollowStatus(profile.id) : false;

    return (
        <main className="min-h-screen bg-background p-6 md:p-12 pb-24">
            <div className="max-w-3xl mx-auto space-y-16">

                {/* 1. Editorial Header */}
                <ProfileHeader
                    profile={profile}
                    currentUser={user}
                    isFollowing={isFollowing}
                />

                {/* 2. Process Timeline (Portfolio) */}
                <ProfileTimeline
                    processes={processes || []}
                    isOwnProfile={isOwnProfile}
                />

            </div>
        </main>
    );
}
