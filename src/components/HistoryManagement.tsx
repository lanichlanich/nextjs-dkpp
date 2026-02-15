"use client";

import { useState, useMemo } from "react";
import { EmployeeDisplay } from "@/lib/employees";
import { EmployeeDocument } from "@/lib/history";
import { Position } from "@/lib/positions";
import {
    FileText,
    Upload,
    Trash2,
    Download,
    FileCheck,
    Plus,
    Search,
    User,
    ChevronRight,
    X,
    Filter,
    ArrowRight,
    Loader2,
    Calendar,
    Briefcase,
    Edit
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { saveDocumentAction, deleteDocumentAction } from "@/actions/history";

interface HistoryManagementProps {
    employees: EmployeeDisplay[];
    initialDocuments: EmployeeDocument[];
    positions: Position[];
}

export function HistoryManagement({ employees, initialDocuments, positions }: HistoryManagementProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [editingDocument, setEditingDocument] = useState<EmployeeDocument | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [documentType, setDocumentType] = useState<'SK_CPNS' | 'SK_PNS' | 'SK_PPPK' | 'SKP' | 'SK_JABATAN' | null>(null);
    const [formData, setFormData] = useState({
        nomorSurat: '',
        tanggalSurat: '',
        tanggalMulai: '',
        tahunSKP: '',
        predikat: '',
        positionId: ''
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);


    const selectedEmployee = useMemo(() =>
        employees.find(e => e.id === selectedEmployeeId) || null,
        [employees, selectedEmployeeId]);

    const filteredEmployees = useMemo(() =>
        employees.filter(emp =>
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.nip.includes(searchTerm)
        ),
        [employees, searchTerm]);

    const employeeDocuments = useMemo(() =>
        initialDocuments.filter(d => d.employeeId === selectedEmployeeId),
        [initialDocuments, selectedEmployeeId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            Swal.fire('Error', 'File harus berformat PDF', 'error');
            e.target.value = '';
            return;
        }

        const maxSize = 2 * 1024 * 1024; // Increased to 2MB as remote servers usually handle more
        if (file.size > maxSize) {
            Swal.fire('Error', 'Ukuran file maksimal 2MB', 'error');
            e.target.value = '';
            return;
        }

        setSelectedFile(file);
    };

    const generateFileName = () => {
        if (!selectedEmployee || !documentType) return '';
        const nip = selectedEmployee.nip;
        switch (documentType) {
            case 'SK_CPNS': return `sk_cpns_${nip}.pdf`;
            case 'SK_PNS': return `sk_pns_${nip}.pdf`;
            case 'SK_PPPK': return `sk_pppk_${nip}.pdf`;
            case 'SKP': return `skp_${nip}_${formData.tahunSKP || 'tahun'}.pdf`;
            case 'SK_JABATAN': return `sk_jabatan_${nip}.pdf`;
            default: return '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmployee || !documentType || (!selectedFile && !editingDocument)) {
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
            formDataToSend.append('employeeId', selectedEmployee.id);
            formDataToSend.append('documentType', documentType);
            formDataToSend.append('fileName', fileName);

            if (editingDocument) {
                formDataToSend.append('documentId', editingDocument.id);
            }

            if (documentType === 'SKP') {
                formDataToSend.append('tahunSKP', formData.tahunSKP);
                formDataToSend.append('predikat', formData.predikat);
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
                setFormData({ nomorSurat: '', tanggalSurat: '', tanggalMulai: '', tahunSKP: '', predikat: '', positionId: '' });
                setSelectedFile(null);
                setShowUploadModal(false);
                setDocumentType(null);
                setEditingDocument(null);
                window.location.reload();
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
        setSelectedFile(null); // Clear selected file when editing
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
                window.location.reload();
            }
        }
    };

    const groupedDocuments = employeeDocuments.reduce((acc, doc) => {
        if (!acc[doc.documentType]) acc[doc.documentType] = [];
        acc[doc.documentType].push(doc);
        return acc;
    }, {} as Record<string, EmployeeDocument[]>);

    return (
        <div className="flex h-[calc(100vh-120px)] overflow-hidden gap-6">
            {/* Sidebar: Employee Selection */}
            <div className="w-80 flex-shrink-0 flex flex-col bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                    <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-green-600" />
                        Pilih Pegawai
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari NIP atau Nama..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-sm font-medium text-gray-900"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {filteredEmployees.map(emp => (
                        <button
                            key={emp.id}
                            onClick={() => setSelectedEmployeeId(emp.id)}
                            className={`w-full text-left p-4 rounded-2xl transition-all duration-200 group relative ${selectedEmployeeId === emp.id
                                ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                                : 'hover:bg-gray-50 text-gray-700'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className={`font-bold truncate ${selectedEmployeeId === emp.id ? 'text-white' : 'text-gray-900'}`}>
                                        {emp.name}
                                    </p>
                                    <p className={`text-xs mt-0.5 ${selectedEmployeeId === emp.id ? 'text-green-50' : 'text-gray-500'}`}>
                                        {emp.nip}
                                    </p>
                                </div>
                                <ChevronRight className={`w-4 h-4 transition-transform ${selectedEmployeeId === emp.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'
                                    }`} />
                            </div>
                            <div className={`mt-2 inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${selectedEmployeeId === emp.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                }`}>
                                {emp.status}
                            </div>
                        </button>
                    ))}
                    {filteredEmployees.length === 0 && (
                        <div className="p-8 text-center">
                            <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                            <p className="text-gray-400 text-sm font-medium">Pegawai tidak ditemukan</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Area: Document Management */}
            <div className="flex-1 flex flex-col min-w-0">
                <AnimatePresence mode="wait">
                    {selectedEmployee ? (
                        <motion.div
                            key={selectedEmployee.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 flex flex-col h-full overflow-hidden"
                        >
                            {/* Profile Header */}
                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg shadow-gray-200/50 mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg shadow-green-200">
                                        <User className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 leading-tight">
                                            {selectedEmployee.name}
                                        </h2>
                                        <div className="flex items-center gap-3 mt-1 text-gray-500 font-bold text-sm">
                                            <span>NIP: {selectedEmployee.nip}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                                            <span className="text-green-600">{selectedEmployee.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingDocument(null);
                                        setDocumentType(null);
                                        setFormData({ nomorSurat: '', tanggalSurat: '', tanggalMulai: '', tahunSKP: '', predikat: '', positionId: '' });
                                        setSelectedFile(null);
                                        setShowUploadModal(true);
                                    }}
                                    className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-gray-200 active:scale-95"
                                >
                                    <Plus className="w-4 h-4" />
                                    Tambah Dokumen
                                </button>
                            </div>

                            {/* Documents Section */}
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {Object.keys(groupedDocuments).length > 0 ? (
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-6">
                                        {Object.entries(groupedDocuments).map(([type, docs]) => (
                                            <motion.div
                                                layout
                                                key={type}
                                                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                                            >
                                                <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-50 flex items-center justify-between">
                                                    <h3 className="font-black text-gray-900 flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-green-600" />
                                                        {type.replace('_', ' ')}
                                                    </h3>
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
                                                                    {doc.documentType === 'SKP' ? (
                                                                        <>
                                                                            <p className="font-bold text-gray-900 group-hover:text-green-900">SKP Tahun {doc.tahunSKP}</p>
                                                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                                                Predikat: <span className="text-green-600">{doc.predikat}</span>
                                                                            </p>
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
                                                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => handleEdit(doc)}
                                                                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                                                                    title="Edit"
                                                                >
                                                                    <Edit className="w-5 h-5" />
                                                                </button>
                                                                <a
                                                                    href={doc.filePath.startsWith('http') ? `/api/view-file?url=${encodeURIComponent(doc.filePath)}` : doc.filePath}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                                    title="Buka File"
                                                                >
                                                                    <ArrowRight className="w-5 h-5" />
                                                                </a>
                                                                <button
                                                                    onClick={() => handleDelete(doc.id, doc.fileName)}
                                                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
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
                        </motion.div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4 }}
                                className="w-24 h-24 bg-white rounded-full shadow-2xl shadow-gray-200 flex items-center justify-center mb-6"
                            >
                                <ArrowRight className="w-12 h-12 text-gray-200 -rotate-180" />
                            </motion.div>
                            <h2 className="text-2xl font-black text-gray-300 uppercase tracking-widest">Pilih Pegawai</h2>
                            <p className="text-gray-400 mt-2 font-bold uppercase tracking-widest text-xs">Untuk mengelola berkas riwayat</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Upload Modal */}
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
                            className="relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
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
                                            { type: 'SK_JABATAN', label: 'SK Jabatan' }
                                        ].map(({ type, label }) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setDocumentType(type as any)}
                                                className={`p-3 rounded-xl border-2 font-bold text-sm transition-all text-center ${documentType === type
                                                    ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-100 scale-[1.02]'
                                                    : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'
                                                    }`}
                                                disabled={!!editingDocument} // Disable type change when editing
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
                                        className="space-y-4 overflow-hidden pt-4"
                                    >
                                        {documentType === 'SKP' ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Tahun SKP</label>
                                                    <input
                                                        type="text"
                                                        value={formData.tahunSKP}
                                                        onChange={(e) => setFormData({ ...formData, tahunSKP: e.target.value })}
                                                        placeholder="2024"
                                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-gray-900"
                                                        required
                                                    />
                                                </div>
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
                                        className="flex-1 px-6 py-4 rounded-2xl font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest text-xs transition-all"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !documentType}
                                        className="flex-[2] bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-green-200 flex items-center justify-center gap-3 active:scale-[0.98]"
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
        </div>
    );
}
