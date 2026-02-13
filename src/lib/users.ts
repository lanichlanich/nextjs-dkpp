import fs from "fs/promises";
import path from "path";

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: "Admin" | "Pegawai";
    createdAt: string;
}

const usersFilePath = path.join(process.cwd(), "src/data/users.json");

export async function getUsers(): Promise<User[]> {
    try {
        const fileContent = await fs.readFile(usersFilePath, "utf8");
        return JSON.parse(fileContent);
    } catch (error) {
        console.error("Error reading users:", error);
        return [];
    }
}

export async function saveUser(user: User): Promise<User> {
    const users = await getUsers();
    const existingIndex = users.findIndex((u) => u.id === user.id);

    if (existingIndex >= 0) {
        users[existingIndex] = { ...users[existingIndex], ...user };
    } else {
        users.push(user);
    }

    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
    return user;
}

export async function deleteUser(id: string): Promise<boolean> {
    const users = await getUsers();
    const filteredUsers = users.filter((u) => u.id !== id);

    if (users.length === filteredUsers.length) return false;

    await fs.writeFile(usersFilePath, JSON.stringify(filteredUsers, null, 2));
    return true;
}
