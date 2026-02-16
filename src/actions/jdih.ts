"use server";

import { saveJdihDocument, deleteJdihDocument, JdihDocument } from "@/lib/jdih";
import { revalidatePath } from "next/cache";

export async function saveJdihAction(data: Partial<JdihDocument>) {
    try {
        const result = await saveJdihDocument(data);
        revalidatePath("/admin/jdih");
        revalidatePath("/jdih");
        return result;
    } catch (error: any) {
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
