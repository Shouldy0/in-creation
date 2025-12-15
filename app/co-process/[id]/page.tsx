import { createClient } from '@/utils/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { getCoProcess } from '@/actions/co-process';
import CoProcessView from '@/components/co-process/CoProcessView';

export default async function CoProcessDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const coProcess = await getCoProcess(params.id);

    if (!coProcess) {
        notFound();
    }

    return <CoProcessView coProcess={coProcess} currentUserId={user.id} />;
}
