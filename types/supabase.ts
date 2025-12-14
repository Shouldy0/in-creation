export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    updated_at: string | null
                    username: string | null
                    full_name: string | null
                    bio: string | null
                    disciplines: string[] | null
                    current_state: 'Idea' | 'Blocked' | 'Flow' | 'Revision' | 'Resting' | null
                    avatar_url: string | null
                }
                Insert: {
                    id: string
                    updated_at?: string | null
                    username?: string | null
                    full_name?: string | null
                    bio?: string | null
                    disciplines?: string[] | null
                    current_state?: 'Idea' | 'Blocked' | 'Flow' | 'Revision' | 'Resting' | null
                    avatar_url?: string | null
                }
                Update: {
                    id?: string
                    updated_at?: string | null
                    username?: string | null
                    full_name?: string | null
                    bio?: string | null
                    disciplines?: string[] | null
                    current_state?: 'Idea' | 'Blocked' | 'Flow' | 'Revision' | 'Resting' | null
                    avatar_url?: string | null
                }
            }
            processes: {
                Row: {
                    id: string
                    user_id: string
                    created_at: string
                    updated_at: string
                    title: string
                    description: string | null
                    phase: 'Idea' | 'Blocked' | 'Flow' | 'Revision' | 'Finished'
                    visibility: 'public' | 'private'
                    status: 'draft' | 'published'
                    media_url: string | null
                    media_type: 'image' | 'audio' | null
                    reflection_question: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    created_at?: string
                    updated_at?: string
                    title: string
                    description?: string | null
                    phase?: 'Idea' | 'Blocked' | 'Flow' | 'Revision' | 'Finished'
                    visibility?: 'public' | 'private'
                    status?: 'draft' | 'published'
                    media_url?: string | null
                    media_type?: 'image' | 'audio' | null
                    reflection_question?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    created_at?: string
                    updated_at?: string
                    title?: string
                    description?: string | null
                    phase?: 'Idea' | 'Blocked' | 'Flow' | 'Revision' | 'Finished'
                    visibility?: 'public' | 'private'
                    status?: 'draft' | 'published'
                    media_url?: string | null
                    media_type?: 'image' | 'audio' | null
                    reflection_question?: string | null
                }
            }
            feedback: {
                Row: {
                    id: string
                    post_id: string
                    user_id: string
                    created_at: string
                    type: 'works' | 'doesnt_work' | 'inspired'
                    content: string
                    parent_id: string | null
                }
                Insert: {
                    id?: string
                    post_id: string
                    user_id: string
                    created_at?: string
                    type: 'works' | 'doesnt_work' | 'inspired'
                    content: string
                    parent_id?: string | null
                }
                Update: {
                    id?: string
                    post_id?: string
                    user_id?: string
                    created_at?: string
                    type?: 'works' | 'doesnt_work' | 'inspired'
                    content?: string
                    parent_id?: string | null
                }
            }
            mentor_responses: {
                Row: {
                    process_id: string
                    created_at: string
                    updated_at: string
                    summary: string | null
                    questions: string[] | null
                    exercise: string | null
                }
                Insert: {
                    process_id: string
                    created_at?: string
                    updated_at?: string
                    summary?: string | null
                    questions?: string[] | null
                    exercise?: string | null
                }
                Update: {
                    process_id?: string
                    created_at?: string
                    updated_at?: string
                    summary?: string | null
                    questions?: string[] | null
                    exercise?: string | null
                }
            }
        }
    }
}
