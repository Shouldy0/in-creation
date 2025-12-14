'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function followUser(targetId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from('follows')
        .insert({
            follower_id: user.id,
            followed_id: targetId
        });

    if (error) {
        console.error("Follow error:", error);
        throw new Error("Failed to follow user");
    }

    revalidatePath(`/profile/${targetId}`);
    revalidatePath('/feed');
}

export async function unfollowUser(targetId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('followed_id', targetId);

    if (error) {
        console.error("Unfollow error:", error);
        throw new Error("Failed to unfollow user");
    }

    revalidatePath(`/profile/${targetId}`);
    revalidatePath('/feed');
}

export async function updateCreativeState(newState: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from('profiles')
        .update({ current_state: newState as any }) // Type cast if needed
        .eq('id', user.id);

    if (error) {
        console.error("Update state error:", error);
        throw new Error("Failed to update state");
    }

    revalidatePath('/feed');
    revalidatePath(`/profile/${user.id}`);
}

export async function updateProfile(formData: {
    username: string;
    bio: string;
    disciplines: string[];
    current_state: string;
    avatar_url?: string;
    onboarding_answer?: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Sanitize and Validate (Basic)
    if (formData.username.length < 3) throw new Error("Username too short");

    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            username: formData.username,
            bio: formData.bio,
            disciplines: formData.disciplines,
            current_state: formData.current_state as any,
            avatar_url: formData.avatar_url,
            onboarding_answer: formData.onboarding_answer,
            updated_at: new Date().toISOString()
        });

    if (error) {
        console.error("Update profile error:", error);
        throw new Error(error.message);
    }

    revalidatePath(`/profile/${user.id}`);
    revalidatePath('/feed');
    revalidatePath('/settings');
}

export async function getFollowStatus(targetId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data } = await supabase
        .from('follows')
        .select('created_at')
        .eq('follower_id', user.id)
        .eq('followed_id', targetId)
        .single();

    return !!data;
}

export async function searchUsers(query: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!query || query.length < 2) return [];

    // Search profiles
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, disciplines')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(5);

    if (!profiles || profiles.length === 0) return [];

    // If authenticated, check follow status for each result
    if (user) {
        // Fetch all follows for current user
        const { data: follows } = await supabase
            .from('follows')
            .select('followed_id')
            .eq('follower_id', user.id);

        const followedIds = new Set(follows?.map(f => f.followed_id));

        return profiles.map(profile => ({
            ...profile,
            isFollowing: followedIds.has(profile.id),
            isSelf: profile.id === user.id
        }));
    }

    return profiles.map(profile => ({
        ...profile,
        isFollowing: false,
        isSelf: false
    }));
}
