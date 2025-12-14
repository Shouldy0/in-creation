'use client';

import { useEffect, useState } from 'react';

// Client component because we might want to dismiss it? 
// Or just server rendered text?
// Simplest: Server Component that takes props.
// User requested "Micro-education copy ... Simple moderation".
// Let's make it a functional banner component.

export default function ObserverBanner({ daysLeft }: { daysLeft: number }) {
    const [isVisible, setIsVisible] = useState(true);

    if (daysLeft <= 0 || !isVisible) return null;

    return (
        <div className="w-full bg-paper border-b border-stone/20 p-3 text-center animate-fade relative group">
            <p className="text-sm text-stone font-medium">
                🌱 <span className="text-foreground">Observer Mode</span> ·
                <span className="text-accent ml-1">{daysLeft} day{daysLeft > 1 ? 's' : ''} remaining</span>
                <span className="hidden sm:inline mx-2 text-stone/40">|</span>
                <span className="hidden sm:inline"> Take time to listen and resonate before contributing.</span>
            </p>
            <button
                onClick={() => setIsVisible(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone/40 hover:text-foreground transition-colors p-1"
                aria-label="Dismiss"
            >
                ✕
            </button>
        </div>
    );
}
