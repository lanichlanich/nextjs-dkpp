import prisma from "./prisma";

export interface RolePermissions {
    canManageNews: boolean;
    canManageUsers: boolean;
    canManageProfile: boolean;
    canManageJdih: boolean;
}

export interface SystemSettings {
    [role: string]: RolePermissions;
}

export async function getSettings(): Promise<SystemSettings> {
    try {
        const settings = await prisma.setting.findMany();
        const settingsMap: SystemSettings = {};
        settings.forEach(s => {
            settingsMap[s.role] = {
                canManageNews: s.canManageNews,
                canManageUsers: s.canManageUsers,
                canManageProfile: s.canManageProfile,
                canManageJdih: s.canManageJdih,
            };
        });
        return settingsMap;
    } catch (error) {
        console.error("Error reading settings from DB:", error);
        return {
            "Pegawai": { canManageNews: true, canManageUsers: false, canManageProfile: false, canManageJdih: false },
            "Admin": { canManageNews: true, canManageUsers: true, canManageProfile: true, canManageJdih: true }
        };
    }
}

export async function updateRolePermissions(role: string, permissions: RolePermissions): Promise<SystemSettings> {
    await prisma.setting.upsert({
        where: { role },
        update: permissions,
        create: { role, ...permissions },
    });
    return await getSettings();
}
