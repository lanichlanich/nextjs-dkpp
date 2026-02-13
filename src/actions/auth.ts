"use server";

import { getUsers } from "@/lib/users";
import { setSession, clearSession, getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const users = await getUsers();
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
        return { error: "Email atau password salah!" };
    }

    await setSession(user);

    // We don't redirect here because the client handles it after showing success
    return { success: true };
}

export async function getSessionAction() {
    return await getSession();
}

export async function logoutAction() {
    await clearSession();
    redirect("/login");
}
