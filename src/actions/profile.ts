"use server";

import { getProfileData, saveProfileData, ProfileData } from "@/lib/profile";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

async function checkPermission() {
    const session = await getSession();
    if (!session) return false;
    if (session.role === "Admin") return true;

    const settings = await getSettings();
    return settings.Pegawai.canManageProfile;
}

export async function getProfileAction() {
    return await getProfileData();
}

export async function updateProfileAction(data: ProfileData) {
    if (!(await checkPermission())) {
        return { error: "Anda tidak memiliki izin untuk mengelola profil dinas!" };
    }

    await saveProfileData(data);

    revalidatePath("/admin/profile");
    revalidatePath("/profil");
    revalidatePath("/");

    return { success: true, message: "Profil Dinas berhasil diperbarui!" };
}
