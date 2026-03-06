"use client";

import { useState, useMemo } from "react";
import { EmployeeDisplay } from "@/lib/employees";
import { EmployeeDocument } from "@/lib/history";
import { Position } from "@/lib/positions";
import {
    FileText,
    Upload,
    Trash2,
    FileCheck,
    Plus,
    X,
    ArrowRight,
    Loader2,
    Edit
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import {
    saveDocumentAction,
    deleteDocumentAction
} from "@/actions/history";
import { useRouter } from "next/navigation";

interface EmployeeHistoryOverlayProps {
    employee: EmployeeDisplay;
    documents: EmployeeDocument[];
    positions: Position[];
    onClose: () => void;
}

export function EmployeeHistoryOverlay({ employee, documents, positions, onClose }: EmployeeHistoryOverlayProps) {
    const router = useRouter();
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [editingDocument, setEditingDocument] = useState<EmployeeDocument | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [documentType, setDocumentType] = useState<'SK_CPNS' | 'SK_PNS' | 'SK_PPPK' | 'SKP' | 'SK_JABATAN' | 'PAKTA_INTEGRITAS' | null>(null);
    const [formData, setFormData] = useState({
        nomorSurat: '',
        tanggalSurat: '',
        tanggalMulai: '',
        tahunSKP: '2026',
        predikat: '',
        positionId: ''
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            Swal.fire('Error', 'File harus berformat PDF', 'error');
            e.target.value = '';
            return;
        }

        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            Swal.fire('Error', 'Ukuran file maksimal 2MB', 'error');
            e.target.value = '';
            return;
        }

        setSelectedFile(file);
    };

    const generateFileName = () => {
        if (!employee || !documentType) return '';
        const nip = employee.nip;
        switch (documentType) {
            case 'SK_CPNS': return `sk_cpns_${nip}.pdf`;
            case 'SK_PNS': return `sk_pns_${nip}.pdf`;
            case 'SK_PPPK': return `sk_pppk_${nip}.pdf`;
            case 'SKP': return `skp_${nip}_${formData.tahunSKP || 'tahun'}.pdf`;
            case 'SK_JABATAN': return `sk_jabatan_${nip}.pdf`;
            case 'PAKTA_INTEGRITAS': return `${nip}_${employee.name.replace(/\s+/g, '_')}.pdf`;
            default: return '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!employee || !documentType || (!selectedFile && !editingDocument)) {
            Swal.fire('Error', 'Lengkapi semua field', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const fileName = selectedFile ? generateFileName() : editingDocument?.fileName || '';
            const formDataToSend = new FormData();

            if (selectedFile) {
                formDataToSend.append('file', selectedFile);
            }
            formDataToSend.append('employeeId', employee.id);
            formDataToSend.append('documentType', documentType);
            formDataToSend.append('fileName', fileName);

            if (editingDocument) {
                formDataToSend.append('documentId', editingDocument.id);
            }

            if (documentType === 'SKP' || documentType === 'PAKTA_INTEGRITAS') {
                formDataToSend.append('tahunSKP', formData.tahunSKP);
                if (documentType === 'SKP') {
                    formDataToSend.append('predikat', formData.predikat);
                }
            } else {
                formDataToSend.append('nomorSurat', formData.nomorSurat);
                formDataToSend.append('tanggalSurat', formData.tanggalSurat);
                formDataToSend.append('tanggalMulai', formData.tanggalMulai);
                if (documentType === 'SK_JABATAN') {
                    formDataToSend.append('positionId', formData.positionId);
                }
            }

            const result = await saveDocumentAction(formDataToSend);

            if ('error' in result) {
                Swal.fire('Error', result.error, 'error');
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: `Dokumen berhasil di${editingDocument ? 'perbarui' : 'simpan'}`,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
                setFormData({ nomorSurat: '', tanggalSurat: '', tanggalMulai: '', tahunSKP: '2026', predikat: '', positionId: '' });
                setSelectedFile(null);
                setShowUploadModal(false);
                setDocumentType(null);
                setEditingDocument(null);
                router.refresh();
            }
        } catch (error) {
            Swal.fire('Error', 'Gagal menyimpan dokumen', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (doc: EmployeeDocument) => {
        setEditingDocument(doc);
        setDocumentType(doc.documentType);
        setFormData({
            nomorSurat: doc.nomorSurat || '',
            tanggalSurat: doc.tanggalSurat ? new Date(doc.tanggalSurat).toISOString().split('T')[0] : '',
            tanggalMulai: doc.tanggalMulai ? new Date(doc.tanggalMulai).toISOString().split('T')[0] : '',
            tahunSKP: doc.tahunSKP || '',
            predikat: doc.predikat || '',
            positionId: doc.positionId || ''
        });
        setSelectedFile(null);
        setShowUploadModal(true);
    };

    const handleDelete = async (id: string, fileName: string) => {
        const result = await Swal.fire({
            title: 'Hapus Dokumen?',
            text: `Dokumen ${fileName} akan dihapus permanen`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            customClass: { popup: 'rounded-2xl' }
        });

        if (result.isConfirmed) {
            const deleteResult = await deleteDocumentAction(id);
            if ('error' in deleteResult) {
                Swal.fire('Error', deleteResult.error, 'error');
            } else {
                router.refresh();
            }
        }
    };

    const groupedDocuments = useMemo(() => {
        return documents.reduce((acc, doc) => {
            if (!acc[doc.documentType]) acc[doc.documentType] = [];
            acc[doc.documentType].push(doc);
            return acc;
        }, {} as Record<string, EmployeeDocument[]>);
    }, [documents]);

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
            />

            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-[90vh]"
            >
                {/* Header */}
                <div className="bg-white border-b border-gray-100 p-8 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-white">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-green-600 flex items-center justify-center text-white shadow-xl shadow-green-100">
                            <FileText className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 leading-tight flex items-center gap-3">
                                Riwayat Dokumen
                            </h2>
                            <div className="flex items-center gap-3 mt-1 text-gray-500 font-bold text-sm">
                                <span className="text-green-600">{employee.name}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                <span> {employee.nip}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-900 border border-transparent hover:border-gray-200"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/30">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Daftar Berkas</h3>
                        <button
                            onClick={() => {
                                setEditingDocument(null);
                                setDocumentType(null);
                                setFormData({ nomorSurat: '', tanggalSurat: '', tanggalMulai: '', tahunSKP: '2026', predikat: '', positionId: '' });
                                setSelectedFile(null);
                                setShowUploadModal(true);
                            }}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-green-100 active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah Dokumen
                        </button>
                    </div>

                    {Object.keys(groupedDocuments).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                            {Object.entries(groupedDocuments).map(([type, docs]) => (
                                <motion.div
                                    layout
                                    key={type}
                                    className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                                >
                                    <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-50 flex items-center justify-between">
                                        <h4 className="font-black text-xs text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                            {type.replace('_', ' ')}
                                        </h4>
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-lg">
                                            {docs.length} FILE
                                        </span>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {docs.map((doc) => (
                                            <div key={doc.id} className="group p-4 bg-white hover:bg-green-50/50 border border-gray-100 rounded-2xl transition-all duration-300 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-green-100 flex items-center justify-center transition-colors">
                                                        <FileCheck className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                                                    </div>
                                                    <div>
                                                        {doc.documentType === 'SKP' || doc.documentType === 'PAKTA_INTEGRITAS' ? (
                                                            <>
                                                                <p className="font-bold text-gray-900 group-hover:text-green-900">
                                                                    {doc.documentType === 'PAKTA_INTEGRITAS' ? 'Pakta Integritas' : 'SKP'} Tahun {doc.tahunSKP}
                                                                </p>
                                                                {doc.documentType === 'SKP' && (
                                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                                        Predikat: <span className="text-green-600">{doc.predikat}</span>
                                                                    </p>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <p className="font-bold text-gray-900 group-hover:text-green-900 truncate max-w-[150px] sm:max-w-xs">{doc.nomorSurat}</p>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-2">
                                                                    <span>TMT: {doc.tanggalMulai ? new Date(doc.tanggalMulai).toLocaleDateString('id-ID') : '-'}</span>
                                                                    {doc.documentType === 'SK_JABATAN' && (
                                                                        <>
                                                                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                                            <span className="text-gray-400 italic font-medium lowercase">({doc.position?.namaJabatan})</span>
                                                                        </>
                                                                    )}
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleEdit(doc)}
                                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <a
                                                        href={doc.filePath.startsWith('http') ? `/api/view-file?url=${encodeURIComponent(doc.filePath)}` : doc.filePath}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                        title="Buka File"
                                                    >
                                                        <ArrowRight className="w-5 h-5" />
                                                    </a>
                                                    <button
                                                        onClick={() => handleDelete(doc.id, doc.fileName)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <FileText className="w-10 h-10 text-gray-200" />
                            </div>
                            <p className="text-xl font-black text-gray-400">Belum ada dokumen</p>
                            <p className="text-gray-400 mt-2 font-medium">Klik "Tambah Dokumen" untuk mengunggah SK atau SKP</p>
                        </div>
                    )}
                </div>

                {/* Internal Upload Modal */}
                <AnimatePresence>
                    {showUploadModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => !isSubmitting && setShowUploadModal(false)}
                                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
                            >
                                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50 text-gray-900">
                                    <h3 className="text-xl font-black uppercase tracking-tight">
                                        {editingDocument ? 'Edit Dokumen' : 'Tambah Dokumen'}
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowUploadModal(false);
                                            setEditingDocument(null);
                                        }}
                                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                    <div className="space-y-4">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Jenis Dokumen</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { type: 'SK_CPNS', label: 'SK CPNS' },
                                                { type: 'SK_PNS', label: 'SK PNS' },
                                                { type: 'SK_PPPK', label: 'SK PPPK' },
                                                { type: 'SKP', label: 'SKP' },
                                                { type: 'SK_JABATAN', label: 'SK Jabatan' },
                                                { type: 'PAKTA_INTEGRITAS', label: 'Pakta Integritas' }
                                            ].map(({ type, label }) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setDocumentType(type as any)}
                                                    className={`p-3 rounded-2xl border-2 font-black text-xs transition-all text-center ${documentType === type
                                                        ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-100 scale-[1.02]'
                                                        : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'
                                                        }`}
                                                    disabled={!!editingDocument}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {documentType && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-4 overflow-hidden pt-2"
                                        >
                                            {documentType === 'SKP' || documentType === 'PAKTA_INTEGRITAS' ? (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Tahun</label>
                                                        <select
                                                            value={formData.tahunSKP}
                                                            onChange={(e) => setFormData({ ...formData, tahunSKP: e.target.value })}
                                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-gray-900"
                                                            required
                                                        >
                                                            {Array.from({ length: 11 }, (_, i) => 2020 + i).map(year => (
                                                                <option key={year} value={year.toString()}>{year}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    {documentType === 'SKP' && (
                                                        <div>
                                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Predikat</label>
                                                            <select
                                                                value={formData.predikat}
                                                                onChange={(e) => setFormData({ ...formData, predikat: e.target.value })}
                                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-gray-900"
                                                                required
                                                            >
                                                                <option value="">Pilih...</option>
                                                                <option value="Sangat Baik">Sangat Baik</option>
                                                                <option value="Baik">Baik</option>
                                                                <option value="Perlu Perbaikan">Kurang</option>
                                                            </select>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div>
                                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Nomor Surat</label>
                                                            <input
                                                                type="text"
                                                                value={formData.nomorSurat}
                                                                onChange={(e) => setFormData({ ...formData, nomorSurat: e.target.value })}
                                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-gray-900"
                                                                required
                                                            />
                                                        </div>
                                                        {documentType === 'SK_JABATAN' && (
                                                            <div>
                                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Jabatan Baru</label>
                                                                <select
                                                                    value={formData.positionId}
                                                                    onChange={(e) => setFormData({ ...formData, positionId: e.target.value })}
                                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-gray-900"
                                                                    required
                                                                >
                                                                    <option value="">Pilih Jabatan...</option>
                                                                    {positions.map(pos => (
                                                                        <option key={pos.id} value={pos.id}>{pos.namaJabatan}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Tgl Surat</label>
                                                            <input
                                                                type="date"
                                                                value={formData.tanggalSurat}
                                                                onChange={(e) => setFormData({ ...formData, tanggalSurat: e.target.value })}
                                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-gray-900"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Tgl Mulai (TMT)</label>
                                                            <input
                                                                type="date"
                                                                value={formData.tanggalMulai}
                                                                onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })}
                                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-gray-900"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Pilih File PDF</label>
                                                <div className="relative group/file">
                                                    <input
                                                        type="file"
                                                        accept=".pdf"
                                                        onChange={handleFileChange}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                        required={!editingDocument}
                                                    />
                                                    <div className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${selectedFile || editingDocument ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 group-hover/file:bg-gray-100'
                                                        }`}>
                                                        {selectedFile ? (
                                                            <>
                                                                <FileCheck className="w-8 h-8 text-green-600 mb-2" />
                                                                <p className="text-sm font-black text-green-900 truncate max-w-xs">{selectedFile.name}</p>
                                                                <p className="text-[10px] font-bold text-green-600">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                            </>
                                                        ) : editingDocument ? (
                                                            <>
                                                                <FileCheck className="w-8 h-8 text-blue-600 mb-2" />
                                                                <p className="text-sm font-black text-blue-900 truncate max-w-xs">{editingDocument.fileName}</p>
                                                                <p className="text-[10px] font-bold text-blue-600 text-center">Gunakan file saat ini atau<br />upload baru untuk mengganti</p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Upload className="w-8 h-8 text-gray-300 mb-2" />
                                                                <p className="text-sm font-bold text-gray-500">Klik atau geser file PDF ke sini</p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="pt-4 flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowUploadModal(false)}
                                            disabled={isSubmitting}
                                            className="flex-1 px-6 py-4 rounded-2xl font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest text-[10px] transition-all"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !documentType}
                                            className="flex-[2] bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-3 active:scale-[0.98]"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Mengunggah...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-4 h-4" />
                                                    Simpan Berkas
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #e5e7eb;
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #d1d5db;
                    }
                `}</style>
            </motion.div>
        </div>
    );
}
