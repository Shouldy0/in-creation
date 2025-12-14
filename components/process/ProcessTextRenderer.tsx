'use client';

import ResonanceButton from './ResonanceButton';

interface ProcessTextRendererProps {
    text: string;
    processId: string;
    blocksStatus: Record<number, { hasResonated: boolean; count: number }>;
    currentUserId?: string;
}

export default function ProcessTextRenderer({
    text,
    processId,
    blocksStatus = {}, // Default value
    currentUserId
}: ProcessTextRendererProps) {
    // Split by double newline to identify paragraphs
    // Filter out empty lines
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);

    return (
        <div className="space-y-6">
            {paragraphs.map((paragraph, index) => {
                const status = blocksStatus[index] || { hasResonated: false, count: 0 };

                return (
                    <div key={index} className="group relative">
                        {/* Text Block */}
                        <p className="text-lg leading-relaxed text-foreground whitespace-pre-wrap">
                            {paragraph}
                        </p>

                        {/* Floating Action (appears on hover or if resonated) */}
                        <div className={`
                            absolute -right-8 top-0 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300
                            ${status.count > 0 ? 'opacity-100' : ''}
                        `}>
                            <ResonanceButton
                                processId={processId}
                                initialHasResonated={status.hasResonated}
                                initialCount={status.count}
                                currentUserId={currentUserId}
                                blockIndex={index}
                                minimal={true} // Add minimal prop for small icon
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
