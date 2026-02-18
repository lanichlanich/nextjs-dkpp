"use client";

import { useState, useEffect, useRef } from "react";
import { X, Save, FileText, Hash, Calendar, FileType, Info, Link as LinkIcon, Upload, FileUp } from "lucide-react";
import { JdihDocument } from "@/lib/jdih";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

interface JdihModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: FormData) => Promise<void>;
    document?: JdihDocument | null;
}

const DOCUMENT_TYPES = [
    "Peraturan Daerah",
    "Peraturan Bupati",
    "Keputusan Bupati",
    "Instruksi Bupati",
    "Surat Edaran Bupati",
    "Lainnya"
];

export function JdihModal({ isOpen, onClose, onSave, document }: JdihModalProps) {
    const [formData, setFormData] = useState<Partial<JdihDocument>>({
        title: "",
        type: "Peraturan Daerah",
        number: "",
        year: new Date().getFullYear().toString(),
        description: "",
        filePath: "",
    });
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (document) {
            setFormData({
                id: document.id,
                title: document.title,
                type: document.type,
                number: document.number,
                year: document.year,
                description: document.description || "",
                filePath: document.filePath || "",
                fileName: document.fileName || "",
            });
        } else {
            setFormData({
                title: "",
                type: "Peraturan Daerah",
                number: "",
                year: new Date().getFullYear().toString(),
                description: "",
                filePath: "",
            });
        }
        setPdfFile(null);
    }, [document, isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                Swal.fire("Gagal", "File harus berformat PDF", "error");
                return;
            }
            setPdfFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.number || !formData.year) {
            Swal.fire("Peringatan", "Field Judul, Nomor, dan Tahun harus diisi", "warning");
            return;
        }

        const data = new FormData();
        if (formData.id) data.append('id', formData.id);
        data.append('title', formData.title || '');
        data.append('type', formData.type || '');
        data.append('number', formData.number || '');
        data.append('year', formData.year || '');
        data.append('description', formData.description || '');

        if (pdfFile) {
            data.append('file', pdfFile);
        } else if (formData.filePath) {
            data.append('filePath', formData.filePath);
        }

        setIsSubmitting(true);
        try {
            await onSave(data);
            onClose();
        } catch (error) {
            console.error("Save error:", error);
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
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-blue-50/50">
                            <h3 className="text-xl font-extrabold text-gray-900">
                                {document ? "Edit" : "Tambah"} <span className="text-blue-600">Dokumen Hukum</span>
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
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                                    Judul Dokumen
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 font-medium resize-none shadow-inner"
                                    placeholder="Contoh: Pembentukan Produk Hukum Daerah..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <FileType className="w-3.5 h-3.5 text-blue-600" />
                                        Jenis Produk Hukum
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 font-bold appearance-none shadow-sm"
                                    >
                                        {DOCUMENT_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Hash className="w-3.5 h-3.5 text-blue-600" />
                                        Nomor
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.number}
                                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 font-medium shadow-sm"
                                        placeholder="Contoh: 12"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                        Tahun
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 font-medium shadow-sm"
                                        placeholder="2024"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <FileUp className="w-3.5 h-3.5 text-blue-600" />
                                        Upload PDF
                                    </label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 outline-none transition-all cursor-pointer hover:bg-white overflow-hidden shadow-sm flex items-center gap-2"
                                    >
                                        <Upload className={`w-4 h-4 ${pdfFile ? "text-blue-600" : "text-gray-400"}`} />
                                        <span className={`text-sm truncate flex-1 font-bold ${pdfFile ? "text-blue-700" : (formData.filePath ? "text-green-600" : "text-gray-500")}`}>
                                            {pdfFile ? pdfFile.name : (formData.filePath ? "✅ PDF Terupload" : "Pilih file PDF...")}
                                        </span>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="application/pdf"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Info className="w-3.5 h-3.5 text-blue-600" />
                                    Keterangan Ringkas
                                </label>
                                <input
                                    type="text"
                                    value={formData.description || ""}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 font-medium shadow-sm"
                                    placeholder="Tentang regulasi ini..."
                                />
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-black text-sm uppercase tracking-wide transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
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
