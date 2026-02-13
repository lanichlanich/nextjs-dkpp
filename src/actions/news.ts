"use server";

import { createNews, deleteNews, updateNews } from "@/lib/news";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

async function checkPermission(permission: "canManageNews" | "canManageUsers") {
    const session = await getSession();
    if (!session) return false;
    if (session.role === "Admin") return true;

    const settings = await getSettings();
    return settings.Pegawai[permission];
}

export async function createNewsAction(formData: FormData) {
    const title = formData.get("title") as string;
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const status = formData.get("status") as "Draft" | "Published" | "Archived";
    const image = formData.get("image") as string;

    if (!(await checkPermission("canManageNews"))) {
        return { error: "Anda tidak memiliki izin untuk mengelola berita!" };
    }

    await createNews({
        title,
        excerpt,
        content,
        status,
        image: image || "https://images.unsplash.com/photo-1500382017468-9049fed747ef", // Default image
        date: new Date().toISOString().split("T")[0],
    });

    revalidatePath("/admin/news");
    revalidatePath("/");

    return { success: true, message: "Berita berhasil dibuat!" };
}

export async function updateNewsAction(id: string, formData: FormData) {
    const title = formData.get("title") as string;
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const status = formData.get("status") as "Draft" | "Published" | "Archived";
    const image = formData.get("image") as string;

    if (!(await checkPermission("canManageNews"))) {
        return { error: "Anda tidak memiliki izin untuk mengelola berita!" };
    }

    await updateNews(id, {
        title,
        excerpt,
        content,
        status,
        image,
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
