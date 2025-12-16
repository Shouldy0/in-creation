import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import UpgradeModal from '@/components/pro/UpgradeModal';
import CoProcessForm from '@/components/co-process/CoProcessForm';

export default async function NewCoProcessPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single();

    // FEATURE GATE: Check if user is PRO
    if (profile?.plan !== 'pro') {
        return (
            <div className="container max-w-md mx-auto py-24 px-4">
                <UpgradeModal />
            </div>
        );
    }

    return <CoProcessForm />;
}
