"use server";

import { saveDocument, deleteDocument, getDocumentById } from "@/lib/history";
import { revalidatePath } from "next/cache";
import { writeFile, unlink } from "fs/promises";
import path from "path";

export async function saveDocumentAction(formData: FormData) {
    try {
        // Extract file
        const file = formData.get('file') as File;
        if (!file) {
            return { error: "File tidak ditemukan" };
        }

        // Validate file type
        if (file.type !== 'application/pdf') {
            return { error: "File harus berformat PDF" };
        }

        // Validate file size (max 1MB)
        const maxSize = 1 * 1024 * 1024;
        if (file.size > maxSize) {
            return { error: "Ukuran file maksimal 1MB" };
        }

        // Extract other form data
        const employeeId = formData.get('employeeId') as string;
        const documentType = formData.get('documentType') as string;
        const nomorSurat = formData.get('nomorSurat') as string | null;
        const tanggalSuratStr = formData.get('tanggalSurat') as string | null;
        const tanggalMulaiStr = formData.get('tanggalMulai') as string | null;
        const tahunSKP = formData.get('tahunSKP') as string | null;
        const predikat = formData.get('predikat') as string | null;
        const positionId = formData.get('positionId') as string | null;
        const fileName = formData.get('fileName') as string;

        // Parse dates only if they exist
        const tanggalSurat = tanggalSuratStr ? new Date(tanggalSuratStr) : undefined;
        const tanggalMulai = tanggalMulaiStr ? new Date(tanggalMulaiStr) : undefined;

        // Save file
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
        const filePath = `/uploads/documents/${fileName}`;
        const fullPath = path.join(uploadDir, fileName);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(fullPath, buffer);

        // Save to database
        const result = await saveDocument({
            employeeId,
            documentType: documentType as any,
            nomorSurat: nomorSurat || undefined,
            tanggalSurat,
            tanggalMulai,
            tahunSKP: tahunSKP || undefined,
            predikat: predikat || undefined,
            positionId: positionId || undefined,
            filePath,
            fileName
        });

        revalidatePath("/admin/history");
        revalidatePath("/admin/employees");
        return { success: true, data: result };
    } catch (error: any) {
        console.error("Save document error:", error);
        return { error: error.message || "Gagal menyimpan dokumen" };
    }
}

export async function deleteDocumentAction(id: string) {
    try {
        // Get document to find file path
        const document = await getDocumentById(id);

        if (document) {
            // Delete file from filesystem
            const fullPath = path.join(process.cwd(), 'public', document.filePath);
            try {
                await unlink(fullPath);
            } catch (fileError) {
                console.error("Error deleting file:", fileError);
                // Continue with database deletion even if file deletion fails
            }
        }

        await deleteDocument(id);
        revalidatePath("/admin/history");
        revalidatePath("/admin/employees");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Gagal menghapus dokumen" };
    }
}
