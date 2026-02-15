"use server";

import { savePosition, deletePosition, PositionInput, Position } from "@/lib/positions";
import { revalidatePath } from "next/cache";

export async function savePositionAction(data: PositionInput) {
    try {
        const result = await savePosition(data);
        revalidatePath("/admin/positions");
        return { success: true, data: result };
    } catch (error: any) {
        console.error("Save position error:", error);
        return { error: error.message || "Gagal menyimpan jabatan" };
    }
}

export async function deletePositionAction(id: string) {
    try {
        await deletePosition(id);
        revalidatePath("/admin/positions");
        return { success: true };
    } catch (error: any) {
        console.error("Delete position error:", error);
        return { error: error.message || "Gagal menghapus jabatan" };
    }
}

export async function importPositionsAction(data: Partial<Position>[]) {
    try {
        const results = await Promise.all(
            data.map(pos => savePosition(pos as any))
        );
        revalidatePath("/admin/positions");
        return { success: true, count: results.length };
    } catch (error: any) {
        return { error: error.message || "Gagal mengimpor data jabatan" };
    }
}
