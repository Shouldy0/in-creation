'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Image as ImageIcon, Mic, X, UploadCloud } from 'lucide-react';

interface MediaUploaderProps {
    processId: string;
    initialUrl?: string;
    initialType?: string;
    onUploadComplete: (url: string | undefined, type: string | undefined) => void;
}

export default function MediaUploader({ processId, initialUrl, initialType, onUploadComplete }: MediaUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [mediaType, setMediaType] = useState<'image' | 'audio' | undefined>(initialType as any);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(initialUrl);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio') => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const supabase = createClient();

        // File path: {user_id}/{process_id}/{timestamp}.ext
        const fileExt = file.name.split('.').pop();
        const filePath = `${processId}/${Date.now()}.${fileExt}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('process-media')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('process-media').getPublicUrl(filePath);

            setMediaType(type);
            setPreviewUrl(data.publicUrl);
            onUploadComplete(data.publicUrl, type);

        } catch (error: any) {
            console.error('Upload failed', error);
            // alert('Upload failed'); // Removed alert
            // Could add a toast here if available, or just log for MVP
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setMediaType(undefined);
        setPreviewUrl(undefined);
        onUploadComplete(undefined, undefined);
        // Ideally we delete from storage too, but for MVP we skip to avoid accidental data loss complex logic
    };

    if (previewUrl) {
        return (
            <div className="relative rounded-lg overflow-hidden bg-ink border border-ink group">
                <button
                    onClick={handleRemove}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/80 transition-colors z-10"
                >
                    <X size={16} />
                </button>

                {mediaType === 'image' ? (
                    <img src={previewUrl} className="w-full h-64 object-contain bg-black/20" />
                ) : (
                    <div className="h-32 flex items-center justify-center gap-3 text-stone">
                        <Mic size={24} />
                        <audio controls src={previewUrl} className="bg-transparent" />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4">
            <label className={`
                border border-dashed border-stone/30 rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors
                hover:bg-ink hover:border-stone/50
                ${uploading ? 'opacity-50 pointer-events-none' : ''}
            `}>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'image')} />
                <ImageIcon className="text-stone" size={24} />
                <span className="text-xs text-stone font-medium">Add Image</span>
            </label>

            <label className={`
                border border-dashed border-stone/30 rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors
                hover:bg-ink hover:border-stone/50
                ${uploading ? 'opacity-50 pointer-events-none' : ''}
            `}>
                <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleUpload(e, 'audio')} />
                <Mic className="text-stone" size={24} />
                <span className="text-xs text-stone font-medium">Add Audio</span>
            </label>
        </div>
    );
}
