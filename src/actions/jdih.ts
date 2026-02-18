"use server";

import { saveJdihDocument, deleteJdihDocument, JdihDocument } from "@/lib/jdih";
import { revalidatePath } from "next/cache";
import { uploadToServer, sanitizeFilename } from "@/lib/upload";

export async function saveJdihAction(formData: FormData) {
    try {
        const id = formData.get('id') as string | null;
        const title = formData.get('title') as string;
        const type = formData.get('type') as string;
        const number = formData.get('number') as string;
        const year = formData.get('year') as string;
        const description = formData.get('description') as string;
        let filePath = formData.get('filePath') as string | null;

        const file = formData.get('file') as File | null;

        if (file && file.size > 0) {
            // Rename file to match title
            const sanitizedTitle = sanitizeFilename(title);
            const extension = file.name.split('.').pop() || 'pdf';
            const newFileName = `${sanitizedTitle}.${extension}`;

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            filePath = await uploadToServer(buffer, newFileName, file.type);
        }

        const result = await saveJdihDocument({
            id: id || undefined,
            title,
            type,
            number,
            year,
            description,
            filePath,
            fileName: file ? `${sanitizeFilename(title)}.${file.name.split('.').pop() || 'pdf'}` : undefined
        });

        revalidatePath("/admin/jdih");
        revalidatePath("/jdih");
        return result;
    } catch (error: any) {
        console.error("Save JDIH error:", error);
        return { error: error.message || "Gagal menyimpan data JDIH" };
    }
}

export async function deleteJdihAction(id: string) {
    try {
        await deleteJdihDocument(id);
        revalidatePath("/admin/jdih");
        revalidatePath("/jdih");
        return true;
    } catch (error: any) {
        return { error: error.message || "Gagal menghapus data JDIH" };
    }
}
