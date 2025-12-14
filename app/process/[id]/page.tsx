import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProcessMedia from '@/components/process/ProcessMedia';
import FeedbackSection from '@/components/feedback/FeedbackSection';
import MentorPanel from '@/components/mentor/MentorPanel';
import { deleteProcess } from '@/actions/process';
import { getFeedback } from '@/actions/feedback';
import { reportContent } from '@/actions/moderation';

export default async function ProcessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { id } = await params; // Unwrapping params for Next 15/16

  const { data: process } = await supabase
    .from('processes')
    .select(`
      *,
      profiles:user_id (
        username,
        id
      )
    `)
    .eq('id', id)
    .single();

  if (!process) return notFound();

  const isOwner = user?.id === process.user_id;
  const feedbackItems = await getFeedback(process.id);

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_350px] gap-8">

        {/* Left Column: Content */}
        <div>
          <Link href="/feed" className="text-stone hover:text-foreground mb-4 inline-block">← Back to Feed</Link>

          <header className="mb-6 space-y-2">
            <div className="flex justify-between items-start">
              <h1 className="font-serif text-3xl md:text-4xl text-foreground">{process.title}</h1>
              <span className={`px-3 py-1 rounded-full text-xs border border-graphite uppercase tracking-wider text-stone`}>
                {process.phase}
              </span>
            </div>

            <div className="flex items-center gap-2 text-stone text-sm">
              <span>By <Link href={`/profile/${process.profiles?.id}`} className="hover:underline">{process.profiles?.username}</Link></span>
              <span>•</span>
              <span>{new Date(process.created_at).toLocaleDateString()}</span>
            </div>
          </header>

          <ProcessMedia url={process.media_url} type={process.media_type} />

          <div className="prose prose-invert max-w-none mb-8">
            <p className="text-lg leading-relaxed text-foreground whitespace-pre-wrap">{process.description}</p>
            {process.reflection_question && (
              <div className="mt-8 p-6 bg-paper rounded-lg border-l-4 border-accent">
                <p className="text-sm uppercase tracking-widest text-stone mb-2">Reflect</p>
                <p className="font-serif text-xl italic text-foreground">&quot;{process.reflection_question}&quot;</p>
              </div>
            )}
          </div>

          <div className="flex gap-4 text-xs text-stone">
            {/* Owner Actions */}
            {isOwner ? (
              <form action={async () => {
                'use server';
                await deleteProcess(process.id);
              }}>
                <button className="text-state-blocked hover:underline">Delete Process</button>
              </form>
            ) : (
              /* Report Action */
              <form action={async () => {
                'use server';
                await reportContent(process.id, 'process', 'Inappropriate content');
                // In real app, show success toast
              }}>
                <button className="hover:text-state-blocked">Report Content</button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Interaction (Feedback & Mentor) */}
        <div className="space-y-8">
          <div className="p-6 bg-paper rounded-xl border border-ink">
            <h3 className="font-serif text-xl mb-4 text-stone">Feedback</h3>
            <FeedbackSection
              processId={process.id}
              items={feedbackItems || []}
              currentUserId={user?.id}
            />
          </div>

          <div className="p-6 bg-gradient-to-b from-paper to-ink rounded-xl border border-ink">
            <h3 className="font-serif text-xl mb-4 text-accent">Creative Mentor</h3>
            <MentorPanel processId={process.id} />
          </div>
        </div>

      </div>
    </main>
  );
}
