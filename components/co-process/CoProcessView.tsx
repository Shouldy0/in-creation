'use client';

import { useState } from 'react';
import { addEntry, inviteMember, closeCoProcess } from '@/actions/co-process';
import EntryItem from '@/components/co-process/EntryItem';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Plus, UserPlus, FileArchive, Send } from 'lucide-react';

interface CoProcessViewProps {
    coProcess: any; // Type strictly if possible, for now 'any' matches the complex join structure
    currentUserId: string;
}

export default function CoProcessView({ coProcess, currentUserId }: CoProcessViewProps) {
    const [newEntryContent, setNewEntryContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showInvite, setShowInvite] = useState(false);
    const [inviteUsername, setInviteUsername] = useState('');
    const [inviteStatus, setInviteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const isOwner = coProcess.owner_id === currentUserId;

    const handleAddEntry = async () => {
        if (!newEntryContent.trim()) return;
        setIsSubmitting(true);
        try {
            await addEntry(coProcess.id, newEntryContent);
            setNewEntryContent('');
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInvite = async () => {
        if (!inviteUsername.trim()) return;
        setInviteStatus('loading');
        try {
            await inviteMember(coProcess.id, inviteUsername);
            setInviteStatus('success');
            setTimeout(() => {
                setInviteStatus('idle');
                setShowInvite(false);
                setInviteUsername('');
            }, 2000);
        } catch (e) {
            console.error(e);
            setInviteStatus('error');
        }
    };

    const handleClose = async () => {
        if (confirm('Are you sure you want to close this co-process? It will become archived and read-only.')) {
            try {
                await closeCoProcess(coProcess.id);
            } catch (e) {
                console.error(e);
            }
        }
    }

    // Sort entries chronological (oldest first or newest first? Diary usually chronological so oldest on top, 
    // but for a feed newest on top is often better. User Request: "Shared diary (chronological entries)". 
    // Usually means 1, 2, 3... so oldest first? 
    // Let's stick to Newest First for usability unless specified otherwise, or Oldest First if it's strictly a "Journey".
    // "Chronological" usually implies A -> B -> C. So Oldest First makes sense for reading a story.
    // But for a chat/activity feed, newest at bottom is common.
    // Let's do Newest at Top for MVP as it's easier to access recent activity.
    // Wait, "Shared diary (chronological entries)" might essentially mean a log.
    // Let's render newest first for now as its standard for feeds.
    const sortedEntries = [...coProcess.entries].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return (
        <div className="container max-w-3xl mx-auto py-12 px-4">
            {/* Header */}
            <div className="mb-12 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-serif mb-2">{coProcess.title}</h1>
                    {coProcess.description && (
                        <p className="text-muted-foreground">{coProcess.description}</p>
                    )}
                    <div className="flex gap-2 mt-4 text-xs text-muted-foreground">
                        {coProcess.members.map((m: any) => (
                            <span key={m.user_id} className="bg-secondary px-2 py-1 rounded-md">
                                {m.role === 'owner' ? 'Owner' : 'Member'}
                            </span>
                        ))}
                    </div>
                </div>

                {isOwner && coProcess.status === 'active' && (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowInvite(!showInvite)}>
                            <UserPlus size={16} className="mr-2" /> Invite
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={handleClose}>
                            <FileArchive size={16} className="mr-2" /> Close
                        </Button>
                    </div>
                )}
            </div>

            {/* Invite Area */}
            {showInvite && (
                <div className="mb-8 p-4 bg-secondary/30 rounded-xl">
                    <h3 className="text-sm font-medium mb-2">Invite Participant</h3>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Username"
                            value={inviteUsername}
                            onChange={(e) => setInviteUsername(e.target.value)}
                            className="bg-background"
                        />
                        <Button onClick={handleInvite} disabled={inviteStatus === 'loading'}>
                            {inviteStatus === 'loading' ? 'Inviting...' : 'Send'}
                        </Button>
                    </div>
                    {inviteStatus === 'success' && <p className="text-xs text-green-500 mt-2">Invited successfully!</p>}
                    {inviteStatus === 'error' && <p className="text-xs text-destructive mt-2">Failed to invite user.</p>}
                </div>
            )}

            {/* Add Entry Area */}
            {coProcess.status === 'active' && (
                <div className="mb-12 p-6 bg-secondary/20 rounded-xl border border-border/50">
                    <h3 className="text-sm font-serif mb-4 text-muted-foreground">Add to the diary</h3>
                    <Textarea
                        placeholder="Share a moment, a thought, or a breakthrough..."
                        className="mb-4 bg-background min-h-[120px] resize-none border-0 focus-visible:ring-1 focus-visible:ring-primary"
                        value={newEntryContent}
                        onChange={(e) => setNewEntryContent(e.target.value)}
                    />
                    <div className="flex justify-between items-center">
                        {/* Placeholder for Media Upload Button */}
                        <Button variant="ghost" size="sm" className="text-muted-foreground" disabled>
                            <Plus size={16} className="mr-2" /> Add Media (Coming Soon)
                        </Button>

                        <Button onClick={handleAddEntry} disabled={isSubmitting || !newEntryContent.trim()} className="px-6">
                            <Send size={16} className="mr-2" /> Post Entry
                        </Button>
                    </div>
                </div>
            )}

            {/* Entries Feed */}
            <div className="space-y-0">
                {sortedEntries.length > 0 ? (
                    sortedEntries.map((entry: any) => (
                        <EntryItem key={entry.id} entry={entry} currentUserId={currentUserId} />
                    ))
                ) : (
                    <div className="text-center py-12 text-muted-foreground italic">
                        The diary is empty. Start by sharing the first moment.
                    </div>
                )}
            </div>
        </div>
    );
}
