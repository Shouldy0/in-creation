'use client';

import { useState } from 'react';
import { getMentorAdvice } from '@/actions/mentor';

export default function MentorPanel({ processId }: { processId: string }) {
    const [advice, setAdvice] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleAsk = async (forceRefresh = false) => {
        setLoading(true);
        setOpen(true);
        try {
            const data = await getMentorAdvice(processId, forceRefresh);
            setAdvice(data);
        } catch (e) {
            // error
        } finally {
            setLoading(false);
        }
    };

    if (!open) {
        return (
            <button
                onClick={() => handleAsk()}
                className="w-full text-left"
            >
                <span className="text-sm border-b border-accent text-accent pb-1">Ask the Creative Mentor</span>
            </button>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            {loading ? (
                <div className="text-sm text-stone animate-pulse">Consulting the oracle...</div>
            ) : advice ? (
                <div className="space-y-4 text-sm">
                    {advice.summary && (
                        <div className="p-3 bg-paper rounded border border-ink">
                            <p className="text-stone uppercase text-xs mb-1 tracking-wider">Observations</p>
                            <p className="text-foreground">{advice.summary}</p>
                        </div>
                    )}

                    {advice.questions && advice.questions.length > 0 && (
                        <div className="p-3 bg-paper rounded border border-ink">
                            <p className="text-stone uppercase text-xs mb-1 tracking-wider">Reflections</p>
                            <ul className="list-disc list-outside pl-4 space-y-1 text-foreground">
                                {advice.questions.map((q: string, i: number) => (
                                    <li key={i}>{q}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {advice.exercise && (
                        <div className="p-3 bg-ink rounded border border-accent/20">
                            <p className="text-accent uppercase text-xs mb-1 tracking-wider">Exercise</p>
                            <p className="text-foreground italic">&quot;{advice.exercise}&quot;</p>
                        </div>
                    )}

                    <div className="flex gap-4 mt-4 pt-2 border-t border-ink">
                        <button
                            onClick={() => handleAsk(true)}
                            className="text-xs text-accent hover:text-foreground font-medium transition-colors"
                        >
                            ↻ Regenerate
                        </button>
                        <button
                            onClick={() => setAdvice(null)}
                            className="text-xs text-stone hover:text-foreground transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-state-blocked text-sm">Mentor is unavailable.</div>
            )}
        </div>
    );
}
