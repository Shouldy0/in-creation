'use client';

import { useState, useRef, useEffect } from 'react';
import { sendMessage } from '@/actions/messaging';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Message {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    profiles: {
        username: string;
        avatar_url: string | null;
    };
}

interface ConversationViewProps {
    conversationId: string;
    messages: Message[];
    currentUserId: string;
    otherParticipant: {
        username: string;
        avatar_url: string | null;
    };
    contextType: string;
    contextId: string | null;
}

export default function ConversationView({
    conversationId,
    messages: initialMessages,
    currentUserId,
    otherParticipant,
    contextType
}: ConversationViewProps) {
    const [messages, setMessages] = useState(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Scroll to bottom on mount and new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        const content = newMessage.trim();
        setNewMessage('');
        setIsSending(true);

        try {
            // Optimistic update
            const tempId = crypto.randomUUID();
            const optimisticMsg: Message = {
                id: tempId,
                content: content,
                sender_id: currentUserId,
                created_at: new Date().toISOString(),
                profiles: {
                    username: 'Me', // Placeholder
                    avatar_url: null
                }
            };

            setMessages(prev => [...prev, optimisticMsg]);

            await sendMessage(conversationId, content);

            // Revalidation happens on server, but we might want to refresh here if we want perfect sync
            // For MVP, router.refresh() works to get the real message back
            router.refresh();

        } catch (error) {
            console.error("Failed to send", error);
            // Revert optimistic? Or just show error toast.
            alert("Failed to send message");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] md:h-[80vh] max-w-2xl mx-auto border border-stone/10 rounded-lg overflow-hidden bg-background">
            {/* Header */}
            <header className="p-4 border-b border-stone/10 flex items-center gap-4 bg-paper/50">
                <Link href="/feed" className="text-stone hover:text-foreground">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="font-serif text-lg text-foreground">
                        {otherParticipant.username}
                    </h1>
                    <p className="text-xs text-stone uppercase tracking-widest">
                        {contextType === 'process' ? 'Discussing Process' : 'Direct Message'}
                    </p>
                </div>
            </header>

            {/* Messages List */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                {messages.length === 0 ? (
                    <div className="text-center text-stone italic text-sm py-10 opacity-70">
                        Start the conversation...
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === currentUserId;
                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${isMe
                                            ? 'bg-ink text-foreground rounded-br-none'
                                            : 'bg-paper text-stone rounded-bl-none border border-stone/10'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <footer className="p-4 border-t border-stone/10 bg-background">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Write a message..."
                        className="flex-1 bg-paper border border-stone/20 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-stone/50 transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="p-2 rounded-full bg-foreground text-background disabled:opacity-50 hover:opacity-90 transition-opacity"
                    >
                        {isSending ? <Loader2 size={20} className="animate-spin" /> : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        )}
                    </button>
                </form>
            </footer>
        </div>
    );
}
