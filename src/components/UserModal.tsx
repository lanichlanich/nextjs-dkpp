"use client";

import { useState, useEffect } from "react";
import { User } from "@/lib/users";
import { X, Save, User as UserIcon, Shield, Mail, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: User) => Promise<void>;
    user?: User | null;
}

export function UserModal({ isOpen, onClose, onSave, user }: UserModalProps) {
    const [formData, setFormData] = useState<Partial<User>>({
        name: "",
        email: "",
        password: "",
        role: "Pegawai",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData(user);
        } else {
            setFormData({
                name: "",
                email: "",
                password: "",
                role: "Pegawai",
            });
        }
    }, [user, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave({
                ...formData,
                id: user?.id || Date.now().toString(),
                createdAt: user?.createdAt || new Date(),
            } as User);
            onClose();
        } catch (error) {
            Swal.fire("Error", "Gagal menyimpan data pengguna", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-green-50/50">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                {user ? "Edit Pengguna" : "Tambah Pengguna Baru"}
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                                    <UserIcon className="w-4 h-4 mr-2 text-green-600" /> Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 bg-gray-50/50"
                                    placeholder="Masukkan nama lengkap"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                                    <Mail className="w-4 h-4 mr-2 text-green-600" /> Alamat Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 bg-gray-50/50"
                                    placeholder="nama@dkpp.id"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                                    <Lock className="w-4 h-4 mr-2 text-green-600" /> Password
                                </label>
                                <input
                                    type="password"
                                    required={!user}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 bg-gray-50/50"
                                    placeholder={user ? "Biarkan kosong jika tidak diubah" : "Masukkan password"}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                    <Shield className="w-4 h-4 mr-2 text-green-600" /> Peran (Role)
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: "Pegawai" })}
                                        className={`py-2 px-3 border rounded-xl text-sm font-medium transition-all ${formData.role === "Pegawai"
                                            ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-200"
                                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        Pegawai
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: "Admin" })}
                                        className={`py-2 px-3 border rounded-xl text-sm font-medium transition-all ${formData.role === "Admin"
                                            ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-200"
                                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        Admin
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center justify-center disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Simpan
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
