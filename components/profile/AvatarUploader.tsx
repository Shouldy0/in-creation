'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Camera, X, Loader2 } from 'lucide-react';

interface AvatarUploaderProps {
    url?: string;
    onUpload: (url: string) => void;
}

export default function AvatarUploader({ url, onUpload }: AvatarUploaderProps) {
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(url);
    const [uploading, setUploading] = useState(false);

    // Sync with prop if needed (though local upload usually drives it)
    useEffect(() => {
        if (url) setAvatarUrl(url);
    }, [url]);

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            // Use timestamp + random string for uniqueness
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const supabase = createClient();

            // 1. Upload to 'avatars' bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                // Determine if bucket missing or other error
                throw uploadError;
            }

            // 2. Get Public URL
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

            setAvatarUrl(data.publicUrl);
            onUpload(data.publicUrl);

        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            alert('Error uploading avatar: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border border-stone/20 bg-paper flex items-center justify-center">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Camera className="w-10 h-10 text-stone/30" />
                    )}

                    {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                    )}
                </div>

                <label className="absolute bottom-0 right-0 bg-foreground text-background p-2 rounded-full cursor-pointer hover:bg-stone-800 transition-colors shadow-sm" htmlFor="single">
                    <Camera size={16} />
                </label>
                <input
                    style={{
                        visibility: 'hidden',
                        position: 'absolute',
                    }}
                    type="file"
                    id="single"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                />
            </div>
            <p className="text-xs text-stone/50 font-serif italic text-center max-w-xs break-all">
                {avatarUrl ? (
                    <a href={avatarUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-accent">
                        Open Image Debug
                    </a>
                ) : 'Upload a profile image'}
            </p>
        </div>
    );
}
