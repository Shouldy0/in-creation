import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProcessMedia from '@/components/process/ProcessMedia';
import FeedbackSection from '@/components/feedback/FeedbackSection';
import MentorPanel from '@/components/mentor/MentorPanel';
import StartConversationButton from '@/components/messaging/StartConversationButton';
import { deleteProcess } from '@/actions/process';
import { getFeedback } from '@/actions/feedback';
import { reportContent } from '@/actions/moderation';
import { getResonanceStatus } from '@/actions/resonance';
import ResonanceButton from '@/components/process/ResonanceButton';
import ProcessTextRenderer from '@/components/process/ProcessTextRenderer';

export default async function ProcessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { id } = await params;

  const { data: process } = await supabase
    .from('processes')
    .select(`
  *,
  profiles: user_id(
    username,
    id
  )
    `)
    .eq('id', id)
    .single();

  if (!process) return notFound();

  const isOwner = user?.id === process.user_id;
  const feedbackItems = await getFeedback(process.id);
  const resonanceStatus = await getResonanceStatus(process.id);

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_350px] gap-8">

        {/* Left Column: Content */}
        <div>
          <Link href="/feed" className="text-stone hover:text-foreground mb-4 inline-block">← Back to Feed</Link>

          <header className="mb-6 space-y-2">
            <div className="flex justify-between items-start">
              <h1 className="font-serif text-3xl md:text-4xl text-foreground">{process.title}</h1>
              <span className="px-3 py-1 rounded-full text-xs border border-graphite uppercase tracking-wider text-stone">
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
            <ProcessTextRenderer
              text={process.description || ''}
              processId={process.id}
              blocksStatus={resonanceStatus.blocks}
              currentUserId={user?.id}
            />

            {process.reflection_question && (
              <div className="mt-8 p-6 bg-paper rounded-lg border-l-4 border-accent">
                <p className="text-sm uppercase tracking-widest text-stone mb-2">Reflect</p>
                <p className="font-serif text-xl italic text-foreground">&quot;{process.reflection_question}&quot;</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-stone mb-8">
            {/* General Resonance Button */}
            <div className="mr-auto">
              <ResonanceButton
                processId={process.id}
                initialHasResonated={resonanceStatus.general.hasResonated}
                initialCount={resonanceStatus.general.count}
                currentUserId={user?.id}
              />
            </div>

            {/* Owner Actions */}
            {isOwner ? (
              <>
                <Link
                  href={`/process/${process.id}/edit`}
                  className="px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90"
                >
                  Edit Process
                </Link>
                <form action={async () => {
                  'use server';
                  await deleteProcess(process.id);
                }}>
                  <button className="text-state-blocked hover:underline">Delete Process</button>
                </form>
              </>
            ) : (
              <>
                {user && (
                  <StartConversationButton
                    participantId={process.user_id}
                    contextType="process"
                    contextId={process.id}
                    label="Discuss Process"
                    className="px-4 py-2 rounded-full bg-ink text-foreground text-sm font-medium border border-stone/20 hover:bg-paper"
                  />
                )}
                {/* Report Action */}
                <form action={async () => {
                  'use server';
                  await reportContent(process.id, 'process', 'Inappropriate content');
                }}>
                  <button className="hover:text-state-blocked">Report Content</button>
                </form>
              </>
            )}
          </div >
        </div >

        {/* Right Column: Interaction (Feedback & Mentor) */}
        < div className="space-y-8" >
          <div className="p-6 bg-paper rounded-xl border border-ink">
            <h3 className="font-serif text-xl mb-4 text-stone">Feedback</h3>
            <FeedbackSection
              processId={process.id}
              items={feedbackItems || []}
              currentUserId={user?.id}
            />
          </div>

          {isOwner && (
            <div className="p-6 bg-gradient-to-b from-paper to-ink rounded-xl border border-ink">
              <h3 className="font-serif text-xl mb-4 text-accent">Creative Mentor</h3>
              <MentorPanel processId={process.id} />
            </div>
          )}
        </div >

      </div >
    </main >
  );
}
