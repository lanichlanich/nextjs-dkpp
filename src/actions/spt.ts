"use server";

import prisma from "@/lib/prisma";
import { uploadToServer, sanitizeFilename } from "@/lib/upload";
import { revalidatePath } from "next/cache";

export async function submitSpt(formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const nip = formData.get("nip") as string;
        const year = formData.get("year") as string;
        const file = formData.get("file") as File;

        if (!name || !nip || !year || !file) {
            return { success: false, error: "Semua form wajib diisi" };
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            return { success: false, error: "File harus berupa Gambar (JPG, PNG, atau WebP)" };
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            return { success: false, error: "Ukuran file maksimal 5MB" };
        }

        const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
        const sanitizedName = sanitizeFilename(name);
        const fileName = `${sanitizedName}_${nip}_${year}.${extension}`;

        // Convert File to Buffer for upload
        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload file
        const fileUrl = await uploadToServer(buffer, fileName, file.type);

        await prisma.sptReport.create({
            data: {
                name,
                nip,
                year,
                filePath: fileUrl,
                fileName: fileName,
            },
        });

        revalidatePath("/admin/spt");
        return { success: true };
    } catch (error: any) {
        console.error("Error submitting SPT:", error);
        return { success: false, error: error.message || "Gagal mengirim SPT" };
    }
}

export async function getSptReports({
    page = 1,
    limit = 10,
    search = "",
    year = "",
}: {
    page?: number;
    limit?: number;
    search?: string;
    year?: string;
}) {
    try {
        const skip = (page - 1) * limit;

        const where = {
            ...(search && {
                OR: [
                    { name: { contains: search } },
                    { nip: { contains: search } },
                ],
            }),
            ...(year && { year }),
        };

        const [reports, total] = await Promise.all([
            prisma.sptReport.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.sptReport.count({ where }),
        ]);

        return {
            success: true,
            data: reports,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error: any) {
        console.error("Error fetching SPT reports:", error);
        return { success: false, error: "Gagal mengambil data SPT" };
    }
}

export async function deleteSptReport(id: string) {
    try {
        await prisma.sptReport.delete({
            where: { id },
        });

        revalidatePath("/admin/spt");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting SPT:", error);
        return { success: false, error: "Gagal menghapus data SPT" };
    }
}
