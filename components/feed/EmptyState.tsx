// Imports updated
import Link from 'next/link';
import { PenTool, Users } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function EmptyState() {
    const searchParams = useSearchParams();
    const type = searchParams.get('type');
    const isFollowingMode = type === 'following';

    return (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
            <div className="w-16 h-16 rounded-full bg-ink flex items-center justify-center mb-6 text-stone">
                {isFollowingMode ? <Users size={24} /> : <PenTool size={24} />}
            </div>

            <h3 className="text-xl font-serif text-foreground mb-2">
                {isFollowingMode ? "Tutto tace qui." : "Foglio bianco."}
            </h3>

            <p className="text-stone mb-8 max-w-sm mx-auto">
                {isFollowingMode
                    ? "Inizia a seguire altri artisti per curare il tuo feed."
                    : "Nessuno ha ancora condiviso. Rompi tu il ghiaccio in questo stato creativo."}
            </p>

            {isFollowingMode ? (
                <button
                    onClick={() => (document.querySelector('input[placeholder="Cerca artisti..."]') as HTMLInputElement)?.focus()}
                    className="bg-foreground text-background px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
                >
                    Trova Artisti
                </button>
            ) : (
                <Link
                    href="/process/start"
                    className="bg-foreground text-background px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
                >
                    Inizia un processo
                </Link>
            )}
        </div>
    );
}
