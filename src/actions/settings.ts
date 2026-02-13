"use server";

import { getSettings, updateRolePermissions, RolePermissions } from "@/lib/settings";
import { revalidatePath } from "next/cache";
import { verifyRole } from "@/lib/auth";

export async function getSettingsAction() {
    return await getSettings();
}

export async function updateRolePermissionsAction(role: string, permissions: RolePermissions) {
    if (!(await verifyRole("Admin"))) {
        return { error: "Hanya Admin yang dapat mengubah pengaturan peran!" };
    }
    const result = await updateRolePermissions(role, permissions);
    revalidatePath("/admin/settings");
    revalidatePath("/admin/news");
    revalidatePath("/admin/users");
    return result;
}
