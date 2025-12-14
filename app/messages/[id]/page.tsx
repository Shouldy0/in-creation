import { getConversation } from '@/actions/messaging';
import ConversationView from '@/components/messaging/ConversationView';
import { notFound, redirect } from 'next/navigation';

export default async function MessagePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getConversation(id);

    if (!data) {
        return notFound();
    }

    const { conversation, messages, currentUser } = data;

    // Determine "Other" participant
    // If I am A, other is B. If I am B, other is A.
    // The query returns `p1` (A) and `p2` (B).

    // Type casting because standard supabase types might be loose
    const c = conversation as any;

    const otherParticipant = c.participant_a === currentUser.id
        ? c.p2 // I am A, so other is B
        : c.p1; // I am B, so other is A

    return (
        <main className="min-h-screen bg-background p-4 md:p-8">
            <ConversationView
                conversationId={id}
                messages={messages as any}
                currentUserId={currentUser.id}
                otherParticipant={otherParticipant}
                contextType={conversation.context_type}
                contextId={conversation.context_id}
            />
        </main>
    );
}
