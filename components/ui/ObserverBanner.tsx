'use client';

import { useEffect, useState } from 'react';

// Client component because we might want to dismiss it? 
// Or just server rendered text?
// Simplest: Server Component that takes props.
// User requested "Micro-education copy ... Simple moderation".
// Let's make it a functional banner component.

export default function ObserverBanner({ daysLeft }: { daysLeft: number }) {
    if (daysLeft <= 0) return null;

    return (
        <div className="w-full bg-paper border-b border-stone/20 p-3 text-center animate-fade">
            <p className="text-sm text-stone font-medium">
                🌱 <span className="text-foreground">Observer Mode Active</span> —
                You are in a 3-day observation period.
                <span className="hidden sm:inline"> Take time to listen and resonate before contributing.</span>
                <span className="ml-2 text-accent">{daysLeft} day{daysLeft > 1 ? 's' : ''} remaining.</span>
            </p>
        </div>
    );
}
