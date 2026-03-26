"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Search, User as UserIcon, Shield, Trash2, Edit, MoreHorizontal } from "lucide-react";
import { User } from "@/lib/users";
import { UserModal } from "./UserModal";
import { saveUserAction, deleteUserAction } from "@/actions/users";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { StandardPagination } from "./ui/StandardPagination";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "./ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";

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
    const urlLimit = parseInt(searchParams.get("limit") || "10");
    const [itemsPerPage, setItemsPerPage] = useState(urlLimit);

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

    const handleLimitChange = (limit: number) => {
        setItemsPerPage(limit);
        setCurrentPage(1);
        const params = new URLSearchParams(searchParams.toString());
        params.set("limit", limit.toString());
        params.set("page", "1");
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

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

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
            toast.error(result.error as string);
            return;
        }

        router.refresh();
        setIsModalOpen(false);
        toast.success(editingUser ? "Data pengguna diperbarui" : "Pengguna baru ditambahkan");
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;

        setIsActionLoading(true);
        const result = await deleteUserAction(userToDelete.id);

        if (typeof result === 'object' && 'error' in result) {
            toast.error(result.error as string);
        } else if (result === true) {
            toast.success("Akun pengguna telah dihapus");
            router.refresh();
        } else {
            toast.error("Gagal menghapus pengguna");
        }

        setIsActionLoading(false);
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
    };

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setIsDeleteDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-grow max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <Input
                        type="text"
                        placeholder="Cari nama atau email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 pr-4 h-12 bg-white border-slate-200/60 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 font-bold"
                    />
                </div>
                {canManage && (
                    <Button
                        onClick={handleAddUser}
                        size="lg"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-6 rounded-2xl shadow-xl transition-all hover:scale-105"
                    >
                        <Plus className="mr-2 h-6 w-6" />
                        TAMBAH PENGGUNA
                    </Button>
                )}
            </div>

            <Card className="border-slate-200/60 shadow-xl overflow-hidden bg-white">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                                <TableRow>
                                    <TableHead className="pl-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Pengguna</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Peran</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Terdaftar</TableHead>
                                    <TableHead className="w-24 text-right pr-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence mode="popLayout">
                                    {currentItems.length > 0 ? (
                                        currentItems.map((user, index) => (
                                            <motion.tr
                                                key={user.id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="group hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0"
                                            >
                                                <TableCell className="pl-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mr-4 border border-emerald-200 shadow-sm">
                                                            <UserIcon className="w-5 h-5 text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-slate-900 tracking-tight">{user.name}</div>
                                                            <div className="text-xs text-slate-500 font-medium">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={cn(
                                                            "rounded-md font-black text-[9px] uppercase tracking-tighter px-2",
                                                            user.role === 'Admin' ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-0' : 'bg-slate-100 text-slate-700 hover:bg-slate-100 border-0'
                                                        )}
                                                    >
                                                        {user.role === 'Admin' && <Shield className="w-3 h-3 mr-1" />}
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs font-bold text-slate-600 italic">
                                                    {user.createdAt instanceof Date
                                                        ? user.createdAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                                        : String(user.createdAt)}
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    {canManage ? (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger render={
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-md border border-transparent hover:border-slate-200 transition-all">
                                                                    <MoreHorizontal className="h-4 w-4 text-slate-500" />
                                                                </Button>
                                                            } />
                                                            <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl border-slate-200">
                                                                <DropdownMenuItem onClick={() => handleEditUser(user)} className="font-bold py-2 rounded-lg cursor-pointer">
                                                                    <Edit className="mr-2 h-4 w-4 text-indigo-600" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDeleteClick(user)}
                                                                    className="font-bold py-2 rounded-lg cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Hapus
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[9px] font-black uppercase text-slate-400">ReadOnly</Badge>
                                                    )}
                                                </TableCell>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-64 text-center">
                                                <div className="flex flex-col items-center justify-center space-y-3 opacity-60">
                                                    <div className="p-4 bg-slate-50 rounded-full">
                                                        <UserIcon className="w-12 h-12 text-slate-300" />
                                                    </div>
                                                    <p className="text-slate-400 font-bold italic">
                                                        Tidak ada pengguna ditemukan.
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <StandardPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={filteredUsers.length}
                itemsPerPage={itemsPerPage}
                onLimitChange={handleLimitChange}
                color="green"
            />

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveUser}
                user={editingUser}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="rounded-2xl border-slate-200">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black text-slate-900 tracking-tight">Hapus Pengguna?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-bold text-slate-500">
                            Anda akan menghapus akun <span className="text-slate-900 font-black">{userToDelete?.name}</span> secara permanen. Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 mt-4">
                        <AlertDialogCancel className="rounded-xl font-bold border-slate-200 text-slate-600">Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isActionLoading}
                            className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white border-0 shadow-lg"
                        >
                            {isActionLoading ? "Menghapus..." : "Ya, Hapus Permanen"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
