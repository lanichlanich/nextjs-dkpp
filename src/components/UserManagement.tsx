"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Search, User as UserIcon, Shield, Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { User } from "@/lib/users";
import { UserModal } from "./UserModal";
import { saveUserAction, deleteUserAction } from "@/actions/users";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { StandardPagination } from "./ui/StandardPagination";

interface UserManagementProps {
    initialUsers: User[];
    canManage?: boolean;
}

export function UserManagement({ initialUsers, canManage = true }: UserManagementProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [users, setUsers] = useState<User[]>(initialUsers);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Pagination state
    const urlPage = parseInt(searchParams.get("page") || "1");
    const [currentPage, setCurrentPage] = useState(urlPage);
    const itemsPerPage = 10;

    // Sync with server data
    useEffect(() => {
        setUsers(initialUsers);
    }, [initialUsers]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [users, searchQuery]);

    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredUsers.slice(start, start + itemsPerPage);
    }, [filteredUsers, currentPage]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const handleAddUser = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleSaveUser = async (userData: User) => {
        const result = await saveUserAction(userData);

        if ('error' in result) {
            Swal.fire({
                icon: "error",
                title: "Gagal",
                text: result.error,
                confirmButtonColor: "#10b981",
            });
            return;
        }

        router.refresh();
        setIsModalOpen(false);
        Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: editingUser ? "Data pengguna diperbarui" : "Pengguna baru ditambahkan",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000
        });
    };

    const handleDeleteUser = async (id: string, name: string) => {
        const confirm = await Swal.fire({
            title: "Hapus Pengguna?",
            text: `Anda akan menghapus akun ${name}. Tindakan ini tidak dapat dibatalkan!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, Hapus!",
            cancelButtonText: "Batal"
        });

        if (confirm.isConfirmed) {
            const result = await deleteUserAction(id);

            if (typeof result === 'object' && 'error' in result) {
                Swal.fire({
                    icon: "error",
                    title: "Gagal",
                    text: result.error,
                    confirmButtonColor: "#10b981",
                });
                return;
            }

            if (result === true) {
                router.refresh();
                Swal.fire("Terhapus!", "Akun pengguna telah dihapus.", "success");
            } else {
                Swal.fire("Gagal", "Tidak dapat menghapus pengguna.", "error");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-grow max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Cari nama atau email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900 bg-white shadow-sm"
                    />
                </div>
                {canManage && (
                    <button
                        onClick={handleAddUser}
                        className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-green-200 hover-lift active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Tambah Pengguna
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Pengguna</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Peran</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Terdaftar</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-900">
                            {currentItems.length > 0 ? (
                                currentItems.map((user, index) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-green-50/30 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                                    <UserIcon className="w-5 h-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-900">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'Admin'
                                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                                                }`}>
                                                {user.role === 'Admin' && <Shield className="w-3 h-3 mr-1" />}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {user.createdAt instanceof Date
                                                ? user.createdAt.toLocaleDateString('id-ID')
                                                : String(user.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {canManage ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEditUser(user)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id, user.name)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">Read Only</span>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        Tidak ada pengguna ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <StandardPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    totalItems={filteredUsers.length}
                    itemsPerPage={itemsPerPage}
                    color="green"
                />
            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveUser}
                user={editingUser}
            />
        </div>
    );
}
