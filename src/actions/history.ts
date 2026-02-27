"use server";

import { saveDocument, deleteDocument, getDocumentById, getAllDocuments } from "@/lib/history";
import { revalidatePath } from "next/cache";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { uploadToServer } from "@/lib/upload";
import prisma from "@/lib/prisma";

export async function saveDocumentAction(formData: FormData) {
    try {
        const documentId = formData.get('documentId') as string | null;
        const employeeId = formData.get('employeeId') as string;
        const documentType = formData.get('documentType') as string;
        const fileName = formData.get('fileName') as string;

        let existingDoc = null;
        if (documentId) {
            existingDoc = await getDocumentById(documentId);
        }

        // Extract file (optional for edit)
        const file = formData.get('file') as File | null;
        let fileUrl = existingDoc?.filePath || "";

        if (file && file.size > 0) {
            // Validate file type
            if (file.type !== 'application/pdf') {
                return { error: "File harus berformat PDF" };
            }

            // Validate file size (max 2MB)
            const maxSize = 2 * 1024 * 1024;
            if (file.size > maxSize) {
                return { error: "Ukuran file maksimal 2MB" };
            }

            // Save file to Custom Server
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            fileUrl = await uploadToServer(buffer, fileName, file.type);
        } else if (!existingDoc) {
            return { error: "File tidak ditemukan" };
        }

        // Extract other form data
        const nomorSurat = formData.get('nomorSurat') as string;
        const tanggalSuratStr = formData.get('tanggalSurat') as string;
        const tanggalMulaiStr = formData.get('tanggalMulai') as string;
        const tahunSKP = formData.get('tahunSKP') as string;
        const predikat = formData.get('predikat') as string;
        const positionId = formData.get('positionId') as string;

        // Parse dates only if they exist
        const tanggalSurat = tanggalSuratStr ? new Date(tanggalSuratStr) : undefined;
        const tanggalMulai = tanggalMulaiStr ? new Date(tanggalMulaiStr) : undefined;

        // Save to database
        const result = await saveDocument({
            id: documentId || undefined,
            employeeId,
            documentType: documentType as any,
            nomorSurat: nomorSurat || undefined,
            tanggalSurat,
            tanggalMulai,
            tahunSKP: tahunSKP || undefined,
            predikat: predikat || undefined,
            positionId: positionId || undefined,
            filePath: fileUrl,
            fileName: fileName || existingDoc?.fileName || ""
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
            if (document.filePath.startsWith('http')) {
                // It's a remote URL (G-Drive or Custom Server)
                console.log(`Manual deletion required for remote file: ${document.filePath}`);
            } else {
                // Delete file from local filesystem
                const fullPath = path.join(process.cwd(), 'public', document.filePath);
                try {
                    await unlink(fullPath);
                } catch (fileError) {
                    console.error("Error deleting local file:", fileError);
                }
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

export async function getPaktaIntegritasDocumentsAction() {
    try {
        const documents = await getAllDocuments();
        const paktaIntegritas = documents.filter(doc => doc.documentType === 'PAKTA_INTEGRITAS');

        // Include employee names in the result
        const result = await Promise.all(paktaIntegritas.map(async (doc) => {
            const employee = await (prisma as any).employee.findUnique({
                where: { id: doc.employeeId },
                select: { name: true, nip: true }
            });
            return {
                ...doc,
                employeeName: employee?.name || 'Unknown',
                employeeNip: employee?.nip || 'Unknown'
            };
        }));

        return { success: true, data: result };
    } catch (error: any) {
        return { error: error.message || "Gagal mengambil data Pakta Integritas" };
    }
}

export async function getFileAsBase64Action(url: string) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Gagal mengambil file");
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return { success: true, base64: buffer.toString('base64') };
    } catch (error: any) {
        return { error: error.message || "Gagal mengambil file" };
    }
}
