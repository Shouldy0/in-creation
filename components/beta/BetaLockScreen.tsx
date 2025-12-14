import Link from 'next/link';

export default function BetaLockScreen() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-background text-foreground animate-in fade-in duration-700">
            <h1 className="font-serif text-4xl mb-6">Opening slowly.</h1>
            <p className="font-sans text-lg text-stone font-light max-w-md leading-relaxed mb-8">
                We are currently in a closed beta to ensure a calm environment for everyone.
                Your account is on the waitlist.
            </p>
            <div className="p-4 border border-ink rounded bg-paper/50">
                <p className="text-xs text-stone tracking-widest uppercase">Status</p>
                <p className="text-sm font-mono mt-1">WAITING FOR ACCESS</p>
            </div>

            <Link href="/" className="mt-12 text-sm text-stone hover:text-foreground underline underline-offset-4 decoration-stone/30 hover:decoration-foreground transition-all">
                Back to Home
            </Link>
        </div>
    );
}
