export default function SetupPage() {
    return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 text-stone-900 font-sans">
            <div className="max-w-xl bg-white p-8 rounded-lg shadow-xl border border-stone-200 text-center">
                <h1 className="text-3xl font-bold mb-4 text-red-600">Missing Configuration ⚠️</h1>
                <p className="text-lg mb-6">
                    The application cannot start because the Supabase keys are missing.
                </p>

                <div className="text-left bg-stone-100 p-6 rounded-md mb-6 border border-stone-300">
                    <h3 className="font-bold mb-2">How to fix this:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Go to your project folder: <code className="bg-white px-2 py-1 rounded">/Users/daiana/Documents/Social app</code></li>
                        <li>Create a new file named <code className="bg-yellow-100 px-2 py-1 rounded font-bold">.env.local</code></li>
                        <li>Paste your Supabase keys into that file:
                            <pre className="bg-black text-white p-2 mt-2 rounded text-xs overflow-x-auto">
                                NEXT_PUBLIC_SUPABASE_URL=https://...
                                NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
                            </pre>
                        </li>
                        <li className="font-bold text-red-600 mt-2">STOP and RESTART your terminal (npm run dev)</li>
                    </ol>
                </div>

                <div className="flex gap-4 justify-center">
                    <a href="/" className="px-6 py-3 bg-stone-900 text-white rounded-full font-bold hover:opacity-90">
                        I fixed it, Reload! ↻
                    </a>
                </div>
                <p className="mt-4 text-xs text-stone-400">
                    Note: If you don't restart the terminal, it won't work.
                </p>
            </div>
        </div>
    );
}
