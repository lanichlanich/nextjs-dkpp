import prisma from "./prisma";

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: "Admin" | "Pegawai";
    createdAt: Date;
}

export async function getUsers(): Promise<User[]> {
    try {
        return await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        }) as User[];
    } catch (error) {
        console.error("Error reading users:", error);
        return [];
    }
}

export async function saveUser(user: Partial<User> & { email: string }): Promise<User> {
    const { id, ...data } = user;
    if (id) {
        return await prisma.user.update({
            where: { id },
            data: {
                ...data,
                role: data.role as string,
            }
        }) as User;
    } else {
        return await prisma.user.create({
            data: {
                name: data.name || '',
                email: data.email,
                password: data.password || '',
                role: data.role || 'Pegawai',
            }
        }) as User;
    }
}

export async function deleteUser(id: string): Promise<boolean> {
    try {
        await prisma.user.delete({
            where: { id }
        });
        return true;
    } catch (error) {
        console.error("Error deleting user:", error);
        return false;
    }
}
