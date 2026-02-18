"use server";

import { createNews, deleteNews, updateNews } from "@/lib/news";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { uploadToServer } from "@/lib/upload";

async function checkPermission(permission: "canManageNews" | "canManageUsers") {
    const session = await getSession();
    if (!session) return false;
    if (session.role === "Admin") return true;

    const settings = await getSettings();
    return settings.Pegawai[permission];
}

export async function createNewsAction(formData: FormData) {
    if (!(await checkPermission("canManageNews"))) {
        return { error: "Anda tidak memiliki izin untuk mengelola berita!" };
    }

    const title = formData.get("title") as string;
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const status = formData.get("status") as "Draft" | "Published" | "Archived";
    const imageInput = formData.get("image");

    let imageUrl = "https://images.unsplash.com/photo-1500382017468-9049fed747ef"; // Default

    if (imageInput instanceof File && imageInput.size > 0) {
        try {
            const bytes = await imageInput.arrayBuffer();
            const buffer = Buffer.from(bytes);
            imageUrl = await uploadToServer(buffer, imageInput.name, imageInput.type);
        } catch (error: any) {
            return { error: `Gagal mengunggah gambar: ${error.message}` };
        }
    } else if (typeof imageInput === "string" && imageInput.length > 0) {
        imageUrl = imageInput;
    }

    await createNews({
        title,
        excerpt,
        content,
        status,
        image: imageUrl,
        date: new Date().toISOString().split("T")[0],
    });

    revalidatePath("/admin/news");
    revalidatePath("/");

    return { success: true, message: "Berita berhasil dibuat!" };
}

export async function updateNewsAction(id: string, formData: FormData) {
    if (!(await checkPermission("canManageNews"))) {
        return { error: "Anda tidak memiliki izin untuk mengelola berita!" };
    }

    const title = formData.get("title") as string;
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const status = formData.get("status") as "Draft" | "Published" | "Archived";
    const imageInput = formData.get("image");

    let imageUrl;

    if (imageInput instanceof File && imageInput.size > 0) {
        try {
            const bytes = await imageInput.arrayBuffer();
            const buffer = Buffer.from(bytes);
            imageUrl = await uploadToServer(buffer, imageInput.name, imageInput.type);
        } catch (error: any) {
            return { error: `Gagal mengunggah gambar: ${error.message}` };
        }
    } else if (typeof imageInput === "string") {
        imageUrl = imageInput;
    }

    await updateNews(id, {
        title,
        excerpt,
        content,
        status,
        image: imageUrl,
    });

    revalidatePath("/admin/news");
    revalidatePath("/");

    return { success: true, message: "Berita berhasil diperbarui!" };
}

export async function deleteNewsAction(id: string) {
    if (!(await checkPermission("canManageNews"))) {
        return { error: "Anda tidak memiliki izin untuk mengelola berita!" };
    }
    await deleteNews(id);
    revalidatePath("/admin/news");
    revalidatePath("/");

    return { success: true, message: "Berita berhasil dihapus!" };
}
