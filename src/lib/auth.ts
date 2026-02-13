import { cookies } from "next/headers";
import { User, getUsers } from "./users";

const SESSION_COOKIE_NAME = "dkpp_session";

export interface SessionData {
    id: string;
    name: string;
    email: string;
    role: "Admin" | "Pegawai";
}

export async function setSession(user: User) {
    const sessionData: SessionData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
    });
}

export async function getSession(): Promise<SessionData | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie) return null;

    try {
        return JSON.parse(sessionCookie.value) as SessionData;
    } catch (error) {
        return null;
    }
}

export async function clearSession() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function verifyRole(requiredRole: "Admin") {
    const session = await getSession();
    if (!session || session.role !== requiredRole) {
        return false;
    }
    return true;
}
