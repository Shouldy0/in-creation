'use client';

import { createConversation } from '@/actions/messaging';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';

interface StartConversationButtonProps {
    participantId: string;
    contextType: 'process' | 'profile';
    contextId?: string;
    label?: string;
    className?: string; // Allow custom styling
}

export default function StartConversationButton({
    participantId,
    contextType,
    contextId,
    label = "Message",
    className
}: StartConversationButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleClick = async () => {
        setIsLoading(true);
        try {
            const conversationId = await createConversation(participantId, contextType, contextId);
            router.push(`/messages/${conversationId}`);
        } catch (error) {
            console.error("Failed to start conversation", error);
            alert("Could not start conversation. You might be blocked.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={className || "px-4 py-2 rounded-full border border-stone/20 text-stone text-sm hover:text-foreground hover:border-foreground transition-colors flex items-center gap-2"}
        >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />}
            {label}
        </button>
    );
}
