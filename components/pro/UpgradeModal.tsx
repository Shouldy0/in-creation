'use client';

import { useState } from 'react';
import { createCheckoutSession } from '@/actions/stripe';
import { Button } from '@/components/ui/button';
import { Check, Star, Lock, Users, BookOpen } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function UpgradeModal() {
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            const { url } = await createCheckoutSession();
            if (url) {
                window.location.href = url;
            }
        } catch (error: any) {
            console.error(error);
            alert(`Errore: ${error.message || 'Impossibile connettersi a Stripe'}`);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center max-w-md mx-auto p-8 text-center animate-in fade-in duration-500">
            <div className="mb-6 p-4 bg-secondary/50 rounded-full">
                <Star className="w-8 h-8 text-foreground" fill="currentColor" />
            </div>

            <h2 className="text-3xl font-serif mb-4">PRO — Co-Creazione</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
                Prezzo consigliato:<br />
                <span className="font-medium text-foreground">€9 / mese (EU)</span> • <span className="font-medium text-foreground">$12 / mese (USA)</span>
            </p>

            <div className="bg-secondary/20 p-6 rounded-xl w-full mb-8 text-left space-y-4">
                <div className="flex items-center gap-3">
                    <Users size={18} className="text-stone" />
                    <span className="text-sm">Up to 4 participants</span>
                </div>
                <div className="flex items-center gap-3">
                    <BookOpen size={18} className="text-stone" />
                    <span className="text-sm">Shared chronological diary</span>
                </div>
                <div className="flex items-center gap-3">
                    <Lock size={18} className="text-stone" />
                    <span className="text-sm">Private and safe space</span>
                </div>
                <div className="flex items-center gap-3">
                    <Star size={18} className="text-stone" />
                    <span className="text-sm">Deep resonance & feedback</span>
                </div>
            </div>

            <Button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full h-12 text-lg rounded-full font-serif"
            >
                {loading ? <Loader2 className="animate-spin" /> : "Unlock Internal Work"}
            </Button>

            <p className="mt-4 text-xs text-stone">
                Creation is always free. Membership supports the platform.
            </p>
        </div>
    );
}
