import fs from "fs/promises";
import path from "path";

export interface RolePermissions {
    canManageNews: boolean;
    canManageUsers: boolean;
}

export interface SystemSettings {
    [role: string]: RolePermissions;
}

const settingsFilePath = path.join(process.cwd(), "src/data/settings.json");

export async function getSettings(): Promise<SystemSettings> {
    try {
        const fileContent = await fs.readFile(settingsFilePath, "utf8");
        return JSON.parse(fileContent);
    } catch (error) {
        console.error("Error reading settings:", error);
        return {
            "Pegawai": { canManageNews: true, canManageUsers: false },
            "Admin": { canManageNews: true, canManageUsers: true }
        };
    }
}

export async function updateRolePermissions(role: string, permissions: RolePermissions): Promise<SystemSettings> {
    const settings = await getSettings();
    settings[role] = permissions;
    await fs.writeFile(settingsFilePath, JSON.stringify(settings, null, 2));
    return settings;
}
