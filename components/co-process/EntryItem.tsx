'use client';

import { useState } from 'react';
import { formatDate } from '@/utils/format';
import { addFeedback } from '@/actions/co-process';
import { Button } from '@/components/ui/button';
import { MessageSquare, Heart } from 'lucide-react';
import Image from 'next/image';

interface EntryItemProps {
    entry: {
        id: string;
        content: string | null;
        media_url: string | null;
        media_type: 'image' | 'audio' | 'video' | null;
        created_at: string;
        user_id: string;
        feedback: any[];
    };
    currentUserId: string;
}

export default function EntryItem({ entry, currentUserId }: EntryItemProps) {
    const [isResonating, setIsResonating] = useState(false);
    const [showFeedbackInput, setShowFeedbackInput] = useState(false);
    const [feedbackContent, setFeedbackContent] = useState('');

    const handleResonance = async () => {
        setIsResonating(true);
        try {
            await addFeedback(entry.id, 'resonance', '');
            // Optimistic update should be handled by parent or SWR usually,
            // here we might just rely on revalidation or local state for MVP visual feedback
        } catch (e) {
            console.error(e);
        } finally {
            setIsResonating(false);
        }
    };

    const handleFeedback = async () => {
        if (!feedbackContent.trim()) return;
        try {
            await addFeedback(entry.id, 'works', feedbackContent); // Defaulting to 'works' for general feedback for now, or add selector
            setFeedbackContent('');
            setShowFeedbackInput(false);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="py-8 border-b border-border last:border-0">
            <div className="flex gap-4">
                <div className="flex-1">
                    <div className="mb-2 text-xs text-muted-foreground">
                        {formatDate(entry.created_at)}
                    </div>

                    {entry.content && (
                        <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap mb-4 font-serif">
                            {entry.content}
                        </p>
                    )}

                    {entry.media_url && entry.media_type === 'image' && (
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-4 bg-muted">
                            <Image
                                src={entry.media_url}
                                alt="Entry media"
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}
                    {/* Audio/Video handling could be added here */}

                    <div className="flex gap-4 items-center mt-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-primary gap-2 p-0 h-auto"
                            onClick={handleResonance}
                            disabled={isResonating}
                        >
                            <Heart size={16} />
                            <span className="text-xs">Resonate</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-primary gap-2 p-0 h-auto"
                            onClick={() => setShowFeedbackInput(!showFeedbackInput)}
                        >
                            <MessageSquare size={16} />
                            <span className="text-xs">Feedback</span>
                        </Button>
                    </div>

                    {showFeedbackInput && (
                        <div className="mt-4 flex gap-2">
                            <input
                                className="flex-1 bg-secondary/30 rounded-md px-3 py-2 text-sm border-none focus:ring-1 focus:ring-primary outline-none"
                                placeholder="Share your thoughts..."
                                value={feedbackContent}
                                onChange={(e) => setFeedbackContent(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFeedback()}
                            />
                            <Button size="sm" onClick={handleFeedback}>Post</Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Feedback List */}
            {entry.feedback && entry.feedback.length > 0 && (
                <div className="mt-4 pl-4 border-l-2 border-border/50 space-y-3">
                    {entry.feedback.map((f: any) => (
                        <div key={f.id} className="text-sm">
                            <span className="font-medium text-primary/80 mr-2">
                                {f.user_id === currentUserId ? 'You' : 'Member'}
                            </span>
                            <span className="text-muted-foreground">{f.content || 'Resonated with this moment.'}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
