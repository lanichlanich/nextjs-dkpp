"use client";

import { useState, useEffect } from "react";
import { X, Save, Briefcase } from "lucide-react";
import { Position } from "@/lib/positions";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

interface PositionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Position>) => Promise<void>;
    position?: Position | null;
}

export function PositionModal({ isOpen, onClose, onSave, position }: PositionModalProps) {
    const [formData, setFormData] = useState<Partial<Position>>({
        namaJabatan: "",
        jenisJabatan: "Struktural",
        batasUsiaPensiun: 58,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (position) {
            setFormData({
                id: position.id,
                namaJabatan: position.namaJabatan,
                jenisJabatan: position.jenisJabatan,
                eselon: position.eselon || undefined,
                jenjangFungsional: position.jenjangFungsional || undefined,
                jenisPelaksana: position.jenisPelaksana || undefined,
                batasUsiaPensiun: position.batasUsiaPensiun,
            });
        } else {
            setFormData({
                namaJabatan: "",
                jenisJabatan: "Struktural",
                batasUsiaPensiun: 58,
            });
        }
    }, [position, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            Swal.fire("Error", "Gagal menyimpan jabatan", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const eselonOptions = [
        "I.a", "I.b", "II.a", "II.b", "III.a", "III.b", "IV.a", "IV.b"
    ];

    const jenjangFungsionalOptions = [
        "Ahli Pertama", "Ahli Muda", "Ahli Madya", "Ahli Utama",
        "Pemula", "Terampil", "Mahir", "Penyelia"
    ];

    const jenisPelaksanaOptions = [
        "Kelerek", "Operator", "Teknisi"
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <Briefcase className="w-6 h-6" />
                                <h2 className="text-xl font-black">
                                    {position ? "Edit Jabatan" : "Tambah Jabatan"}
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Nama Jabatan */}
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                                    Nama Jabatan
                                </label>
                                <input
                                    type="text"
                                    value={formData.namaJabatan}
                                    onChange={(e) => setFormData({ ...formData, namaJabatan: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 font-medium"
                                    required
                                />
                            </div>

                            {/* Jenis Jabatan */}
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                                    Jenis Jabatan
                                </label>
                                <select
                                    value={formData.jenisJabatan}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        jenisJabatan: e.target.value as any,
                                        eselon: undefined,
                                        jenjangFungsional: undefined,
                                        jenisPelaksana: undefined
                                    })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 font-bold"
                                    required
                                >
                                    <option value="Struktural">Struktural</option>
                                    <option value="Fungsional">Fungsional</option>
                                    <option value="Pelaksana">Pelaksana</option>
                                </select>
                            </div>

                            {/* Conditional Fields */}
                            {formData.jenisJabatan === 'Struktural' && (
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                                        Eselon
                                    </label>
                                    <select
                                        value={formData.eselon || ""}
                                        onChange={(e) => setFormData({ ...formData, eselon: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 font-bold"
                                        required
                                    >
                                        <option value="">-- Pilih Eselon --</option>
                                        {eselonOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {formData.jenisJabatan === 'Fungsional' && (
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                                        Jenjang Fungsional
                                    </label>
                                    <select
                                        value={formData.jenjangFungsional || ""}
                                        onChange={(e) => setFormData({ ...formData, jenjangFungsional: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 font-bold"
                                        required
                                    >
                                        <option value="">-- Pilih Jenjang --</option>
                                        {jenjangFungsionalOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {formData.jenisJabatan === 'Pelaksana' && (
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                                        Jenis Pelaksana
                                    </label>
                                    <select
                                        value={formData.jenisPelaksana || ""}
                                        onChange={(e) => setFormData({ ...formData, jenisPelaksana: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 font-bold"
                                        required
                                    >
                                        <option value="">-- Pilih Jenis --</option>
                                        {jenisPelaksanaOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Batas Usia Pensiun */}
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                                    Batas Usia Pensiun
                                </label>
                                <select
                                    value={formData.batasUsiaPensiun}
                                    onChange={(e) => setFormData({ ...formData, batasUsiaPensiun: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 font-bold"
                                    required
                                >
                                    <option value={58}>58 Tahun</option>
                                    <option value={60}>60 Tahun</option>
                                    <option value={65}>65 Tahun</option>
                                </select>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-black text-sm uppercase tracking-wide transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wide transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
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
