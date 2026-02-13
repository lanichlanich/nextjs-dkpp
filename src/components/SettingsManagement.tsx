"use client";

import { useState } from "react";
import { Shield, Newspaper, Users, Info, CheckCircle2, Lock } from "lucide-react";
import { SystemSettings, RolePermissions } from "@/lib/settings";
import { updateRolePermissionsAction } from "@/actions/settings";
import Swal from "sweetalert2";

interface SettingsManagementProps {
    initialSettings: SystemSettings;
}

export function SettingsManagement({ initialSettings }: SettingsManagementProps) {
    const [settings, setSettings] = useState<SystemSettings>(initialSettings);
    const [isSaving, setIsSaving] = useState(false);

    const togglePermission = async (role: string, permission: keyof RolePermissions) => {
        if (role === 'Admin') return; // Admins are always powerful

        const newPermissions = {
            ...settings[role],
            [permission]: !settings[role][permission]
        };

        const newSettings = {
            ...settings,
            [role]: newPermissions
        };

        setSettings(newSettings);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save Pegawai permissions (since Admin is fixed)
            const result = await updateRolePermissionsAction('Pegawai', settings.Pegawai);

            if (result && typeof result === 'object' && 'error' in result) {
                Swal.fire({
                    icon: "error",
                    title: "Gagal",
                    text: result.error as string,
                    confirmButtonColor: "#10b981",
                });
                return;
            }

            Swal.fire({
                icon: "success",
                title: "Pengaturan Tersimpan",
                text: "Hak akses peran telah diperbarui.",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000
            });
        } catch (error) {
            Swal.fire("Error", "Gagal menyimpan pengaturan", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pegawai Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="p-8 bg-gradient-to-br from-green-50 to-blue-50 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-green-600">
                                <Users className="w-8 h-8" />
                            </div>
                            <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-black uppercase tracking-widest">Role: Pegawai</span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Akses Pegawai</h3>
                        <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                            Konfigurasi fitur apa saja yang dapat diakses oleh akun dengan peran Pegawai.
                        </p>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="flex items-center justify-between group p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                                    <Newspaper className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Kelola Berita</p>
                                    <p className="text-xs text-gray-500">Akses CRUD untuk artikel berita</p>
                                </div>
                            </div>
                            <button
                                onClick={() => togglePermission('Pegawai', 'canManageNews')}
                                className={`w-14 h-8 rounded-full transition-all relative ${settings.Pegawai.canManageNews ? 'bg-green-600' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${settings.Pegawai.canManageNews ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between group p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Kelola Pengguna</p>
                                    <p className="text-xs text-gray-500">Akses manajemen akun pengguna</p>
                                </div>
                            </div>
                            <button
                                onClick={() => togglePermission('Pegawai', 'canManageUsers')}
                                className={`w-14 h-8 rounded-full transition-all relative ${settings.Pegawai.canManageUsers ? 'bg-green-600' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${settings.Pegawai.canManageUsers ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Admin Card (View Only) */}
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden opacity-75">
                    <div className="p-8 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-900">
                                <Shield className="w-8 h-8" />
                            </div>
                            <span className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-full text-xs font-black uppercase tracking-widest">Role: Admin</span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase italic">Full Administrator</h3>
                        <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                            Administrator memiliki akses penuh ke seluruh fitur sistem dan tidak dapat dibatasi.
                        </p>
                    </div>
                    <div className="p-8 space-y-4">
                        <div className="flex items-center gap-3 text-green-600 font-bold bg-green-50 p-4 rounded-2xl border border-green-100">
                            <CheckCircle2 className="w-5 h-5 shrink-0" />
                            Akses Semua Fitur Aktif
                        </div>
                        <div className="flex items-center gap-3 text-gray-400 p-4 rounded-2xl border border-dashed border-gray-200">
                            <Lock className="w-5 h-5 shrink-0" />
                            Konfigurasi Terkunci (Fixed)
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-green-900 rounded-3xl text-white shadow-2xl shadow-green-200/50">
                <div className="flex items-center gap-4 text-center md:text-left">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hidden md:flex">
                        <Info className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-bold text-lg">Simpan Perubahan Anda</p>
                        <p className="text-green-100 text-sm">Pastikan pengaturan sudah sesuai sebelum menyimpan.</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full md:w-auto px-10 py-4 bg-white text-green-900 font-black rounded-2xl hover:bg-green-50 transition-all shadow-xl shadow-black/20 hover-lift active:scale-95 disabled:opacity-50 flex items-center justify-center min-w-[200px]"
                >
                    {isSaving ? (
                        <div className="w-6 h-6 border-4 border-green-900/30 border-t-green-900 rounded-full animate-spin" />
                    ) : (
                        "TERAPKAN PENGATURAN"
                    )}
                </button>
            </div>
        </div>
    );
}
