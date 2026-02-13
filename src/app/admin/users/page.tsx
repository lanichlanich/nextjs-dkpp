import { getUsers } from "@/lib/users";
import { UserManagement } from "@/components/UserManagement";
import { Shield, Users } from "lucide-react";
import { getSettings } from "@/lib/settings";

export default async function AdminUsersPage() {
    const users = await getUsers();
    const settings = await getSettings();

    // Mock role - matches AdminLayout
    const userRole = "Admin";
    const canManage = userRole === "Admin" || settings.Pegawai.canManageUsers;

    return (
        <div className="p-4 md:p-8">
            <div className="mb-8">
                <div className="flex items-center text-green-600 mb-2">
                    <Shield className="w-5 h-5 mr-2" />
                    <span className="font-bold tracking-wider uppercase text-sm">Security & Access</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                            Manajemen <span className="text-green-600">Pengguna</span>
                        </h1>
                        <p className="text-gray-600 mt-2 max-w-2xl">
                            Kelola akun akses pegawai dan administrator untuk sistem DKPP Indramayu.
                        </p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Akun</span>
                            <span className="text-2xl font-black text-gray-900">{users.length}</span>
                        </div>
                        <div className="h-8 w-px bg-gray-100" />
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            <UserManagement initialUsers={users} canManage={canManage} />
        </div>
    );
}
