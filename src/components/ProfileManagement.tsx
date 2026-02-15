"use client";

import { useState } from "react";
import {
    Shield,
    Scale,
    Network,
    Briefcase,
    UserCheck,
    Edit3,
    CheckCircle2
} from "lucide-react";
import { ProfileData } from "@/lib/profile";
import { updateProfileAction } from "@/actions/profile";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { ProfileModal } from "./ProfileModal";

interface ProfileManagementProps {
    initialData: ProfileData;
}

const SummaryCard = ({ title, icon: Icon, items, color }: any) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
        <div className={`p-4 border-b border-gray-100 flex items-center gap-3 ${color}`}>
            <Icon className="w-5 h-5" />
            <h3 className="font-bold text-gray-900">{title}</h3>
        </div>
        <div className="p-5 flex-grow">
            {Array.isArray(items) ? (
                <ul className="space-y-3">
                    {items.map((item: string, idx: number) => (
                        <li key={idx} className="flex gap-3 text-sm text-gray-600 leading-relaxed group">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0 group-hover:scale-125 transition-transform" />
                            <span className="font-medium">{item}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-sm text-gray-500 italic">Data tidak tersedia</div>
            )}
        </div>
    </div>
);

export function ProfileManagement({ initialData }: ProfileManagementProps) {
    const [data, setData] = useState<ProfileData>(initialData);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSave = async (newData: ProfileData) => {
        const result = await updateProfileAction(newData);

        if (result.error) {
            Swal.fire("Gagal", result.error, "error");
        } else {
            setData(newData);
            Swal.fire({
                icon: "success",
                title: "Berhasil",
                text: result.message,
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000
            });
        }
    };

    return (
        <div className="space-y-8 p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                        Profil & <span className="text-green-600">Organisasi</span>
                    </h1>
                    <p className="text-gray-600 mt-2 font-medium">Kelola informasi struktur, regulasi, dan tugas dinas secara terpusat.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-green-200 hover-lift active:scale-95"
                >
                    <Edit3 className="w-5 h-5" />
                    Edit Profil Dinas
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <SummaryCard
                    title="Dasar Hukum & Regulasi"
                    icon={Scale}
                    items={data.dasarHukum}
                    color="bg-blue-50 text-blue-700"
                />

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
                    <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-green-50 text-green-700">
                        <Shield className="w-5 h-5" />
                        <h3 className="font-bold">Struktur Organisasi</h3>
                    </div>
                    <div className="p-5 space-y-6">
                        <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">Kepala Dinas</span>
                            <div className="p-4 bg-green-50/50 rounded-xl border border-green-100">
                                <span className="font-black text-gray-900 text-lg">{data.strukturOrganisasi.pimpinan}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">Sekretariat</span>
                                <div className="space-y-1.5 italic text-sm text-gray-600 font-medium">
                                    {data.strukturOrganisasi.sekretariat.map((s, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                            {s}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">Bidang-Bidang</span>
                                <div className="space-y-1.5 italic text-sm text-gray-600 font-medium">
                                    {data.strukturOrganisasi.bidang.map((b, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                            {b}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
                    <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-purple-50 text-purple-700">
                        <Network className="w-5 h-5" />
                        <h3 className="font-bold">Unit Pelaksana Teknis (UPTD)</h3>
                    </div>
                    <div className="p-5 space-y-6">
                        <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">Kelas A</span>
                            <div className="flex flex-wrap gap-2">
                                {data.uptd.kelasA.map((item, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-700">{item}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">Kelas B</span>
                            <div className="flex flex-wrap gap-2">
                                {data.uptd.kelasB.map((item, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-700">{item}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">Non Struktural</span>
                            <div className="flex flex-wrap gap-2">
                                {data.uptd.nonStruktural.map((item, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-700">{item}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <SummaryCard
                    title="Tugas Pokok & Fungsi"
                    icon={Briefcase}
                    items={data.tugasFungsi}
                    color="bg-orange-50 text-orange-700"
                />

                <SummaryCard
                    title="Jabatan & Tata Kerja"
                    icon={UserCheck}
                    items={data.jabatanTataKerja}
                    color="bg-teal-50 text-teal-700"
                />
            </div>

            <ProfileModal
                isOpen={isModalOpen}
                initialData={data}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
            />
        </div>
    );
}
