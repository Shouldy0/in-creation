export const dynamic = 'force-dynamic';

export default function EnvCheckPage() {
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return (
        <div className="p-8 font-mono text-sm max-w-lg mx-auto border m-8">
            <h1 className="text-xl mb-4 font-bold">Environment Diagnostics</h1>

            <div className="space-y-2">
                <div className="flex justify-between border-b py-2">
                    <span>NEXT_PUBLIC_SUPABASE_URL</span>
                    <span className={hasUrl ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                        {hasUrl ? "PRESENT ✅" : "MISSING ❌"}
                    </span>
                </div>

                <div className="flex justify-between border-b py-2">
                    <span>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                    <span className={hasKey ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                        {hasKey ? "PRESENT ✅" : "MISSING ❌"}
                    </span>
                </div>
            </div>

            <p className="mt-8 text-xs text-stone">
                If MISSING, go to Vercel Project Settings {'>'} Environment Variables and add them.<br />
                Then Redeploy.
            </p>
        </div>
    );
}
