'use client';

import { useState, useEffect, useRef } from 'react';
import { updateProcessAutosave, publishProcess } from '@/actions/process';
import { Loader2, ArrowLeft, Image as ImageIcon, Mic } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MediaUploader from './MediaUploader'; // To be implemented

interface ProcessEditorProps {
    process: {
        id: string;
        title?: string;
        description?: string;
        phase: string;
        media_url?: string;
        media_type?: string;
        status: string;
    };
}

const PHASES = ['Idea', 'Blocked', 'Flow', 'Revision', 'Finished'];

export default function ProcessEditor({ process }: ProcessEditorProps) {
    const router = useRouter();
    const [formData, setFormData] = useState(process);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);

    // Autosave Logic
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pendingUpdates = useRef<Record<string, any>>({});

    const handleAutosave = (newUpdates: Record<string, any>) => {
        // Merge new updates into pending
        pendingUpdates.current = { ...pendingUpdates.current, ...newUpdates };
        setFormData((prev: any) => ({ ...prev, ...newUpdates }));
        setSaving(true);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(async () => {
            try {
                const updatesToSend = { ...pendingUpdates.current };
                pendingUpdates.current = {}; // Clear pending

                await updateProcessAutosave(process.id, updatesToSend);

                setSaving(false);
                setLastSaved(new Date());
            } catch (error) {
                console.error("Autosave failed", error);
                setSaving(false);
            }
        }, 2000);
    };

    const handlePublish = async () => {
        if (!formData.description && !formData.media_url) {
            alert("Please add at least a description or media.");
            return;
        }
        setIsPublishing(true);
        try {
            await publishProcess(process.id);
        } catch (error) {
            console.error(error);
            setIsPublishing(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 sticky top-0 bg-background/95 backdrop-blur py-4 z-10 border-b border-ink">
                <Link href="/feed" className="text-stone hover:text-foreground transition-colors">
                    <ArrowLeft size={20} />
                </Link>

                <div className="flex items-center gap-4">
                    <span className="text-xs text-stone transition-opacity duration-500">
                        {saving ? "Saving..." : lastSaved ? "Saved" : "Draft"}
                    </span>
                    <button
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="bg-foreground text-background px-6 py-2 rounded-full font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                        {isPublishing ? "Publishing..." : "Publish"}
                    </button>
                </div>
            </div>

            {/* Form */}
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Phase Selection */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {PHASES.map(phase => (
                        <button
                            key={phase}
                            onClick={() => handleAutosave({ phase })}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${formData.phase === phase
                                ? 'bg-ink border-stone text-foreground'
                                : 'text-stone hover:text-foreground border border-transparent'
                                }`}
                        >
                            {phase}
                        </button>
                    ))}
                </div>

                {/* Media Uploader Placeholders - will implement properly next */}
                <MediaUploader
                    processId={process.id}
                    initialUrl={formData.media_url}
                    initialType={formData.media_type}
                    onUploadComplete={(url: string | undefined, type: string | undefined) => {
                        handleAutosave({
                            media_url: url,
                            media_type: type
                        });
                    }}
                />

                {/* Text Inputs */}
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Title (optional)"
                        value={formData.title || ''}
                        onChange={(e) => handleAutosave({ title: e.target.value })}
                        className="w-full bg-transparent text-3xl font-serif text-foreground placeholder:text-stone/40 focus:outline-none"
                    />

                    <textarea
                        placeholder="What's happening in your process right now?"
                        value={formData.description || ''}
                        onChange={(e) => handleAutosave({ description: e.target.value })}
                        className="w-full bg-transparent text-lg text-stone placeholder:text-stone/40 focus:outline-none min-h-[200px] resize-none leading-relaxed"
                    />
                </div>
            </div>
        </div>
    );
}
