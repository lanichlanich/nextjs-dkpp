import { supabase } from './supabase';

export function sanitizeFilename(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with hyphens
        .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, '');  // Trim hyphens from start and end
}

export async function uploadToServer(file: Buffer, fileName: string, mimeType: string) {
    const bucketName = 'uploads'; // Ensure this bucket exists in Supabase

    const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
            contentType: mimeType,
            upsert: true
        });

    if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(`Gagal upload ke Supabase: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

    if (!publicUrl) {
        throw new Error('Gagal mendapatkan public URL dari Supabase');
    }

    return publicUrl;
}
