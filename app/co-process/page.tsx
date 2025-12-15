import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import CoProcessCard from '@/components/co-process/CoProcessCard';

export default async function CoProcessDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch active co-process where user is owner or member
    const { data: memberships } = await supabase
        .from('co_process_members')
        .select('co_process_id')
        .eq('user_id', user.id);

    const processIds = memberships?.map(m => m.co_process_id) || [];

    // Get the actual process details
    const { data: activeProcesses } = await supabase
        .from('co_processes')
        .select('*')
        .in('id', processIds)
        .eq('status', 'active');

    const { data: archivedProcesses } = await supabase
        .from('co_processes')
        .select('*')
        .in('id', processIds)
        .eq('status', 'archived')
        .order('updated_at', { ascending: false });

    const currentActive = activeProcesses && activeProcesses.length > 0 ? activeProcesses[0] : null;

    return (
        <div className="container max-w-2xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-serif mb-8 text-foreground">Co-Processes</h1>

            <div className="mb-12">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Current</h2>

                {currentActive ? (
                    <CoProcessCard
                        id={currentActive.id}
                        title={currentActive.title}
                        description={currentActive.description}
                        status={currentActive.status}
                        memberCount={0} // would need a separate query or join to get real count, keeping simple for now
                        lastActive={currentActive.updated_at}
                    />
                ) : (
                    <div className="text-center py-12 border border-dashed border-border rounded-xl">
                        <p className="text-muted-foreground mb-4">You are not in any active co-process.</p>
                        <Link href="/co-process/new">
                            <Button>Start a Co-Process</Button>
                        </Link>
                    </div>
                )}
            </div>

            {archivedProcesses && archivedProcesses.length > 0 && (
                <div>
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Archived</h2>
                    <div className="space-y-4">
                        {archivedProcesses.map(p => (
                            <CoProcessCard
                                key={p.id}
                                id={p.id}
                                title={p.title}
                                description={p.description}
                                status={p.status}
                                memberCount={0}
                                lastActive={p.updated_at}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
