"use server";

import { User, getUsers, saveUser, deleteUser } from "@/lib/users";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

async function checkPermission(permission: "canManageUsers") {
    const session = await getSession();
    if (!session) return false;
    if (session.role === "Admin") return true;

    const settings = await getSettings();
    return settings.Pegawai[permission];
}

export async function getUsersAction() {
    // Only logged in users can see user list
    const session = await getSession();
    if (!session) return [];
    return await getUsers();
}

export async function saveUserAction(user: User) {
    if (!(await checkPermission("canManageUsers"))) {
        return { error: "Anda tidak memiliki izin untuk mengelola pengguna!" };
    }
    const result = await saveUser(user);
    revalidatePath("/admin/users");
    return result;
}

export async function deleteUserAction(id: string) {
    if (!(await checkPermission("canManageUsers"))) {
        return { error: "Anda tidak memiliki izin untuk mengelola pengguna!" };
    }
    const result = await deleteUser(id);
    revalidatePath("/admin/users");
    return result;
}

export async function registerUserAction(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as "Admin" | "Pegawai";
    const token = formData.get("token") as string;

    const users = await getUsers();

    // Check for existing email
    if (users.some(u => u.email === email)) {
        return { error: "Email sudah terdaftar!" };
    }

    // Role-based security check
    if (role === "Admin") {
        if (!token || token.toLowerCase() !== "umpegdkpp") {
            return { error: "Token Admin tidak valid!" };
        }
    }

    const newUser = {
        name,
        email,
        password, // In a real app, hash this!
        role,
    };

    await saveUser(newUser);
    return { success: true };
}
