'use server';

import { createClient } from '@/utils/supabase/server';
import { generateMentorResponse } from '@/utils/gemini';
import { revalidatePath } from 'next/cache';

export async function getMentorAdvice(processId: string, forceRefresh: boolean = false) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // 1. Check Cache
    if (!forceRefresh) {
        const { data: existing } = await supabase
            .from('mentor_responses')
            .select('*')
            .eq('process_id', processId)
            .single();

        if (existing) {
            return existing;
        }
    }

    // 2. Generate New
    // Fetch process details
    const { data: process } = await supabase.from('processes').select('*').eq('id', processId).single();
    const { data: feedback } = await supabase.from('feedback').select('*').eq('post_id', processId);

    if (!process) throw new Error('Process not found');

    const aiResponse = await generateMentorResponse(
        process.title,
        process.description || '',
        process.phase,
        feedback || []
    );

    if (!aiResponse) throw new Error('Mentor is silent right now.');

    // 3. Save to DB (Upsert)
    const { error } = await supabase.from('mentor_responses').upsert({
        process_id: processId,
        summary: aiResponse.summary,
        questions: aiResponse.questions,
        exercise: aiResponse.exercise
    }, { onConflict: 'process_id' });

    if (error) console.error('Failed to save mentor response', error);

    revalidatePath(`/process/${processId}`);
    return { ...aiResponse };
}
