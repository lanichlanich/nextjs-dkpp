"use server";

import { saveAgricultureProduction, deleteAgricultureProduction } from "@/lib/agriculture";
import { revalidatePath } from "next/cache";

export async function saveAgricultureProductionAction(data: {
    id?: string;
    tahun: number;
    komoditas: string;
    produksi: number;
    produktivitas?: number | null;
    luasPanen?: number | null;
}) {
    try {
        if (!data.tahun) {
            throw new Error("Tahun wajib diisi");
        }
        if (!data.komoditas) {
            throw new Error("Komoditas wajib diisi");
        }
        if (data.produksi === undefined || data.produksi === null) {
            throw new Error("Jumlah produksi wajib diisi");
        }

        const result = await saveAgricultureProduction({
            id: data.id || undefined,
            tahun: Number(data.tahun),
            komoditas: data.komoditas,
            produksi: Number(data.produksi),
            produktivitas: data.produktivitas !== undefined && data.produktivitas !== null ? Number(data.produktivitas) : null,
            luasPanen: data.luasPanen !== undefined && data.luasPanen !== null ? Number(data.luasPanen) : null,
        });

        revalidatePath("/admin/sektoral");
        revalidatePath("/sektoral");
        return { success: true, data: result };
    } catch (error: any) {
        console.error("Save Agriculture Production error:", error);
        return { error: error.message || "Gagal menyimpan data statistik pertanian" };
    }
}

export async function deleteAgricultureProductionAction(id: string) {
    try {
        if (!id) {
            throw new Error("ID data tidak valid");
        }

        await deleteAgricultureProduction(id);
        
        revalidatePath("/admin/sektoral");
        revalidatePath("/sektoral");
        return { success: true };
    } catch (error: any) {
        console.error("Delete Agriculture Production error:", error);
        return { error: error.message || "Gagal menghapus data statistik pertanian" };
    }
}
