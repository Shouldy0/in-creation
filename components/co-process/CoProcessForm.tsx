'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCoProcess } from '@/actions/co-process';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

export default function CoProcessForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError(null);

        const title = formData.get('title') as string;
        const description = formData.get('description') as string;

        try {
            await createCoProcess(title, description);
            // Action handles revalidate and redirects, or we redirect here
            router.push('/co-process');
        } catch (e: any) {
            setError(e.message || 'Failed to create co-process');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-md mx-auto py-24 px-4">
            <Link href="/co-process" className="text-sm text-muted-foreground hover:text-foreground mb-8 block">
                ← Back
            </Link>

            <h1 className="text-3xl font-serif mb-2">New Co-Process</h1>
            <p className="text-muted-foreground mb-8">Start a shared creative journey.</p>

            <form action={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">Title</label>
                    <Input
                        id="title"
                        name="title"
                        placeholder="e.g. The Winter Garden"
                        required
                        className="bg-transparent border-b border-stone text-foreground placeholder:text-stone/50 focus:border-foreground rounded-none px-0"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">Description (Optional)</label>
                    <Textarea
                        id="description"
                        name="description"
                        placeholder="What is this shared space for?"
                        className="bg-transparent border border-stone text-foreground placeholder:text-stone/50 focus:border-foreground rounded-md p-3 resize-none h-32"
                    />
                </div>

                {error && (
                    <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                        {error}
                    </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Co-Process'}
                </Button>
            </form>
        </div>
    );
}
