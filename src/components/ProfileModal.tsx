"use client";

import { useState, useEffect } from "react";
import {
    X,
    Save,
    Scale,
    Shield,
    Network,
    Briefcase,
    UserCheck,
    Plus,
    Trash2,
    CheckCircle2
} from "lucide-react";
import { ProfileData } from "@/lib/profile";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ProfileData) => Promise<void>;
    initialData: ProfileData;
}

const ListEditor = ({ title, icon: Icon, items, section, color, onAdd, onRemove, onUpdate }: any) => (
    <div className="bg-gray-50/50 rounded-xl border border-gray-100 overflow-hidden">
        <div className={`p-3 border-b border-gray-100 flex items-center justify-between ${color}`}>
            <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <h4 className="font-bold text-sm">{title}</h4>
            </div>
            <button
                type="button"
                onClick={() => onAdd(section)}
                className="p-1 hover:bg-white/20 rounded-md transition-colors"
            >
                <Plus className="w-4 h-4" />
            </button>
        </div>
        <div className="p-3 space-y-2">
            {items.length > 0 ? (
                items.map((item: string, idx: number) => (
                    <div key={idx} className="flex gap-2">
                        <input
                            type="text"
                            value={item}
                            onChange={(e) => onUpdate(section, idx, e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-white"
                        />
                        <button
                            type="button"
                            onClick={() => onRemove(section, idx)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))
            ) : (
                <div className="text-center py-2 text-xs text-gray-400 italic">No items added</div>
            )}
        </div>
    </div>
);

export function ProfileModal({ isOpen, onClose, onSave, initialData }: ProfileModalProps) {
    const [data, setData] = useState<ProfileData>(initialData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setData(initialData);
        }
    }, [initialData, isOpen]);

    const addItem = (section: keyof ProfileData | "sekretariat" | "bidang" | "kelasA" | "kelasB" | "nonStruktural") => {
        setData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            if (section === "dasarHukum") newData.dasarHukum.push("");
            else if (section === "sekretariat") newData.strukturOrganisasi.sekretariat.push("");
            else if (section === "bidang") newData.strukturOrganisasi.bidang.push("");
            else if (section === "kelasA") newData.uptd.kelasA.push("");
            else if (section === "kelasB") newData.uptd.kelasB.push("");
            else if (section === "nonStruktural") newData.uptd.nonStruktural.push("");
            else if (section === "tugasFungsi") newData.tugasFungsi.push("");
            else if (section === "jabatanTataKerja") newData.jabatanTataKerja.push("");
            return newData;
        });
    };

    const removeItem = (section: any, index: number) => {
        setData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            if (section === "dasarHukum") newData.dasarHukum.splice(index, 1);
            else if (section === "sekretariat") newData.strukturOrganisasi.sekretariat.splice(index, 1);
            else if (section === "bidang") newData.strukturOrganisasi.bidang.splice(index, 1);
            else if (section === "kelasA") newData.uptd.kelasA.splice(index, 1);
            else if (section === "kelasB") newData.uptd.kelasB.splice(index, 1);
            else if (section === "nonStruktural") newData.uptd.nonStruktural.splice(index, 1);
            else if (section === "tugasFungsi") newData.tugasFungsi.splice(index, 1);
            else if (section === "jabatanTataKerja") newData.jabatanTataKerja.splice(index, 1);
            return newData;
        });
    };

    const updateItem = (section: any, index: number, value: string) => {
        setData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            if (section === "dasarHukum") newData.dasarHukum[index] = value;
            else if (section === "sekretariat") newData.strukturOrganisasi.sekretariat[index] = value;
            else if (section === "bidang") newData.strukturOrganisasi.bidang[index] = value;
            else if (section === "kelasA") newData.uptd.kelasA[index] = value;
            else if (section === "kelasB") newData.uptd.kelasB[index] = value;
            else if (section === "nonStruktural") newData.uptd.nonStruktural[index] = value;
            else if (section === "tugasFungsi") newData.tugasFungsi[index] = value;
            else if (section === "jabatanTataKerja") newData.jabatanTataKerja[index] = value;
            return newData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave(data);
            onClose();
        } catch (error) {
            Swal.fire("Error", "Gagal menyimpan data profil", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
                    >
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-green-50/50 flex-shrink-0">
                            <h3 className="text-xl font-extrabold text-gray-900">
                                Edit Profil & <span className="text-green-600">Organisasi</span>
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <ListEditor
                                    title="Dasar Hukum"
                                    icon={Scale}
                                    items={data.dasarHukum}
                                    section="dasarHukum"
                                    color="bg-blue-50 text-blue-900 text-xs uppercase tracking-wider"
                                    onAdd={addItem}
                                    onRemove={removeItem}
                                    onUpdate={updateItem}
                                />

                                <div className="space-y-6">
                                    <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-4">
                                        <div className="flex items-center gap-2 mb-4 text-green-900">
                                            <Shield className="w-4 h-4" />
                                            <h4 className="font-bold text-sm uppercase tracking-wider">Struktur Organisasi</h4>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Pimpinan</label>
                                                <input
                                                    type="text"
                                                    value={data.strukturOrganisasi.pimpinan}
                                                    onChange={(e) => setData({ ...data, strukturOrganisasi: { ...data.strukturOrganisasi, pimpinan: e.target.value } })}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none text-gray-900 font-bold bg-white"
                                                />
                                            </div>
                                            <ListEditor
                                                title="Sekretariat"
                                                icon={CheckCircle2}
                                                items={data.strukturOrganisasi.sekretariat}
                                                section="sekretariat"
                                                color="bg-gray-100 text-gray-900 text-xs"
                                                onAdd={addItem}
                                                onRemove={removeItem}
                                                onUpdate={updateItem}
                                            />
                                            <ListEditor
                                                title="Bidang-Bidang"
                                                icon={Network}
                                                items={data.strukturOrganisasi.bidang}
                                                section="bidang"
                                                color="bg-gray-100 text-gray-900 text-xs"
                                                onAdd={addItem}
                                                onRemove={removeItem}
                                                onUpdate={updateItem}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-4">
                                        <div className="flex items-center gap-2 mb-4 text-purple-900">
                                            <Network className="w-4 h-4" />
                                            <h4 className="font-bold text-sm uppercase tracking-wider">UPTD</h4>
                                        </div>
                                        <div className="space-y-4">
                                            <ListEditor
                                                title="UPTD Kelas A"
                                                icon={CheckCircle2}
                                                items={data.uptd.kelasA}
                                                section="kelasA"
                                                color="bg-gray-100 text-gray-900 text-xs"
                                                onAdd={addItem}
                                                onRemove={removeItem}
                                                onUpdate={updateItem}
                                            />
                                            <ListEditor
                                                title="UPTD Kelas B"
                                                icon={CheckCircle2}
                                                items={data.uptd.kelasB}
                                                section="kelasB"
                                                color="bg-gray-100 text-gray-900 text-xs"
                                                onAdd={addItem}
                                                onRemove={removeItem}
                                                onUpdate={updateItem}
                                            />
                                            <ListEditor
                                                title="Non Struktural"
                                                icon={CheckCircle2}
                                                items={data.uptd.nonStruktural}
                                                section="nonStruktural"
                                                color="bg-gray-100 text-gray-900 text-xs"
                                                onAdd={addItem}
                                                onRemove={removeItem}
                                                onUpdate={updateItem}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <ListEditor
                                    title="Tugas Pokok & Fungsi"
                                    icon={Briefcase}
                                    items={data.tugasFungsi}
                                    section="tugasFungsi"
                                    color="bg-orange-50 text-orange-900 text-xs uppercase tracking-wider"
                                    onAdd={addItem}
                                    onRemove={removeItem}
                                    onUpdate={updateItem}
                                />

                                <ListEditor
                                    title="Jabatan & Tata Kerja"
                                    icon={UserCheck}
                                    items={data.jabatanTataKerja}
                                    section="jabatanTataKerja"
                                    color="bg-teal-50 text-teal-900 text-xs uppercase tracking-wider"
                                    onAdd={addItem}
                                    onRemove={removeItem}
                                    onUpdate={updateItem}
                                />
                            </div>
                        </form>

                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50 flex-shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-xl font-black text-sm uppercase tracking-wide transition-all shadow-lg shadow-green-200 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Simpan Perubahan
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
