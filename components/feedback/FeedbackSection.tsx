'use client';

import { useState } from 'react';
import { addFeedback } from '@/actions/feedback';

type FeedbackProps = {
    processId: string;
    items: any[];
    currentUserId?: string;
};

const TYPES = {
    works: 'This works because...',
    doesnt_work: 'This doesn\'t work yet because...',
    inspired: 'This inspired me to...',
};

export default function FeedbackSection({ processId, items, currentUserId }: FeedbackProps) {
    const [activeType, setActiveType] = useState<keyof typeof TYPES | null>(null);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    const handleSubmit = async (parentId?: string) => {
        if (!content.trim() || !activeType) return;
        setLoading(true);
        try {
            await addFeedback(processId, activeType, content, parentId);
            setContent('');
            setActiveType(null);
            setReplyingTo(null);
        } catch (e) {
            alert('Failed to post feedback');
        } finally {
            setLoading(false);
        }
    };

    const rootItems = items.filter(i => !i.parent_id);

    return (
        <div className="space-y-6">
            {/* List */}
            <div className="space-y-4">
                {rootItems.map(item => {
                    const replies = items.filter(i => i.parent_id === item.id);
                    return (
                        <div key={item.id} className="space-y-2">
                            <div className="p-4 rounded-lg bg-ink border border-graphite/30">
                                <div className="flex justify-between text-xs text-stone mb-1">
                                    <span className="font-medium text-foreground">{item.profiles.username}</span>
                                    <span className="uppercase tracking-wide opacity-50">{item.type.replace('_', ' ')}</span>
                                </div>
                                <p className="text-foreground text-sm">{item.content}</p>
                                {currentUserId && (
                                    <button onClick={() => setReplyingTo(item.id)} className="text-xs text-stone hover:text-accent mt-2">
                                        Reply
                                    </button>
                                )}
                            </div>

                            {/* Replies */}
                            {replies.map(reply => (
                                <div key={reply.id} className="ml-6 p-3 rounded-lg bg-paper/50 border-l-2 border-stone">
                                    <div className="flex justify-between text-xs text-stone mb-1">
                                        <span className="font-medium text-foreground">{reply.profiles.username}</span>
                                    </div>
                                    <p className="text-stone text-sm">{reply.content}</p>
                                </div>
                            ))}

                            {/* Reply Input */}
                            {replyingTo === item.id && (
                                <div className="ml-6 mt-2 animate-in fade-in slide-in-from-top-1">
                                    <div className="relative">
                                        <textarea
                                            className="w-full text-sm bg-ink border border-graphite rounded-md p-3 text-foreground focus:border-accent focus:outline-none min-h-[80px]"
                                            placeholder={`Reply to ${item.profiles.username}...`}
                                            value={content}
                                            onChange={e => setContent(e.target.value)}
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <button
                                                onClick={() => setReplyingTo(null)}
                                                className="px-3 py-1.5 text-xs text-stone hover:text-foreground transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => { setActiveType('inspired'); handleSubmit(item.id); }}
                                                disabled={loading || !content.trim()}
                                                className="px-4 py-1.5 bg-accent text-background text-xs font-medium rounded hover:bg-white transition-colors disabled:opacity-50"
                                            >
                                                {loading ? 'Sending...' : 'Reply'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Main Input */}
            {!replyingTo && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-stone">Leave Feedback</h4>
                    <div className="flex gap-2">
                        {(Object.keys(TYPES) as Array<keyof typeof TYPES>).map(type => (
                            <button
                                key={type}
                                onClick={() => setActiveType(type)}
                                className={`text-xs px-3 py-1 rounded-full border transition-colors ${activeType === type ? 'bg-foreground text-background border-foreground' : 'text-stone border-graphite hover:border-stone'
                                    }`}
                            >
                                {type.replace('_', ' ')}
                            </button>
                        ))}
                    </div>

                    {activeType && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <p className="text-xs text-accent italic">{TYPES[activeType]}</p>
                            <textarea
                                className="w-full bg-ink border border-graphite rounded-md p-3 text-foreground focus:border-accent focus:outline-none min-h-[100px]"
                                placeholder="Constructive, specific, kind..."
                                value={content}
                                onChange={e => setContent(e.target.value)}
                            />
                            <button
                                onClick={() => handleSubmit()}
                                disabled={loading}
                                className="w-full py-2 bg-paper border border-graphite text-foreground rounded hover:bg-ink transition-colors text-sm"
                            >
                                {loading ? 'Posting...' : 'Post Feedback'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
