'use client';

import Image from 'next/image';

export default function ProcessMedia({ url, type }: { url?: string | null, type?: 'image' | 'audio' | null }) {
    if (!url) return null;

    return (
        <div className="w-full bg-ink rounded-lg overflow-hidden border border-paper mb-6">
            {type === 'image' ? (
                <div className="relative aspect-video w-full">
                    {/* Use simple img tag if optimization not configured or for ease */}
                    <img src={url} alt="Process artifact" className="w-full h-full object-contain bg-black" />
                </div>
            ) : type === 'audio' ? (
                <div className="p-8 flex items-center justify-center">
                    <audio controls className="w-full">
                        <source src={url} />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            ) : (
                <div className="p-8 text-center text-stone">Unsupported media type</div>
            )}
        </div>
    );
}
