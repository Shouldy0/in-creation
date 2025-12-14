import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { blockUser } from '@/actions/moderation';

export default async function ProfilePage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params.id)
        .single();

    if (!profile) {
        if (user && user.id === params.id) {
            return redirect('/onboarding');
        }
        return notFound();
    }

    // Fetch Public Processes
    const { data: processes } = await supabase
        .from('processes')
        .select('*')
        .eq('user_id', params.id)
        .eq('status', 'published')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

    const isOwnProfile = user?.id === profile.id;

    return (
        <main className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-3xl mx-auto space-y-12">
                {/* Profile Header */}
                <header className="text-center space-y-4">
                    <div className="w-24 h-24 bg-paper rounded-full mx-auto flex items-center justify-center text-4xl overflow-hidden">
                        {profile.avatar_url ? <img src={profile.avatar_url} /> : profile.username?.[0]}
                    </div>
                    <div>
                        <h1 className="font-serif text-4xl text-foreground">{profile.username}</h1>
                        <p className="text-stone max-w-lg mx-auto mt-2">{profile.bio}</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2">
                        {profile.disciplines?.map((d: string) => (
                            <span key={d} className="px-3 py-1 bg-ink text-stone text-xs rounded-full border border-graphite">{d}</span>
                        ))}
                    </div>

                    <div className="pt-4 flex justify-center gap-4">
                        <span className="px-3 py-1 rounded text-sm bg-accent text-background font-medium">
                            State: {profile.current_state}
                        </span>

                        {isOwnProfile && (
                            <Link href="/settings" className="px-3 py-1 rounded text-sm border border-graphite text-stone hover:text-foreground">
                                Edit Profile
                            </Link>
                        )}

                        {!isOwnProfile && user && (
                            <form action={async () => {
                                'use server';
                                await blockUser(user.id, profile.id);
                                // Ideally redirect or show state
                            }}>
                                <button className="px-3 py-1 rounded text-sm border border-state-blocked text-state-blocked hover:bg-state-blocked/10">
                                    Block User
                                </button>
                            </form>
                        )}
                    </div>
                </header>

                {/* Timeline */}
                <div className="space-y-8">
                    <h2 className="font-serif text-2xl border-b border-ink pb-2">Process Timeline</h2>

                    {!processes || processes.length === 0 ? (
                        <p className="text-stone text-center italic">No published processes yet.</p>
                    ) : (
                        <div className="grid gap-8">
                            {processes.map((post: any) => (
                                <Link key={post.id} href={`/process/${post.id}`} className="block group">
                                    <article className="grid grid-cols-[100px_1fr] gap-6 p-4 rounded-lg hover:bg-ink/50 transition-colors">
                                        <div className="text-stone text-sm text-right pt-1">
                                            {new Date(post.created_at).toLocaleDateString()}
                                            <div className="mt-1 text-xs px-2 py-0.5 bg-paper rounded inline-block border border-graphite">{post.phase}</div>
                                        </div>
                                        <div>
                                            <h3 className="font-serif text-xl text-foreground group-hover:text-accent transition-colors">{post.title}</h3>
                                            <p className="text-stone line-clamp-2 mt-2">{post.description}</p>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
