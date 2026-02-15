"use client";

import { useState, useEffect } from "react";
import { Employee, EmployeeDisplay } from "@/lib/employees";
import { EmployeeDocument } from "@/lib/history";
import { Position } from "@/lib/positions";
import { FileText, Upload, Trash2, Download, Calendar, FileCheck, Plus, Search } from "lucide-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { saveDocumentAction, deleteDocumentAction } from "@/actions/history";

interface HistoryManagementProps {
    employees: EmployeeDisplay[];
    initialDocuments: EmployeeDocument[];
    positions: Position[];
}

export function HistoryManagement({ employees, initialDocuments, positions }: HistoryManagementProps) {
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDisplay | null>(null);
    const [documents, setDocuments] = useState<EmployeeDocument[]>(initialDocuments);
    const [showForm, setShowForm] = useState(false);
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter employees based on search term
    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.nip.includes(searchTerm)
    );

    const handleEmployeeChange = (employeeId: string) => {
        const employee = employees.find(e => e.id === employeeId);
        setSelectedEmployee(employee || null);
        setShowForm(false);
        setDocumentType(null);

        if (employee) {
            // Filter documents for selected employee
            const empDocs = initialDocuments.filter(d => d.employeeId === employeeId);
            setDocuments(empDocs);
        }
    };

    const getAvailableDocumentTypes = () => {
        if (!selectedEmployee) return [];

        const types: Array<{ type: 'SK_CPNS' | 'SK_PNS' | 'SK_PPPK' | 'SKP' | 'SK_JABATAN', label: string }> = [];

        if (selectedEmployee.status === 'PNS' || selectedEmployee.status === 'CPNS') {
            types.push({ type: 'SK_CPNS', label: 'SK CPNS' });
        }
        if (selectedEmployee.status === 'PNS') {
            types.push({ type: 'SK_PNS', label: 'SK PNS' });
            types.push({ type: 'SK_JABATAN', label: 'SK Jabatan' });
        }
        if (selectedEmployee.status === 'PPPK' || selectedEmployee.status === 'PPPK Paruh Waktu') {
            types.push({ type: 'SK_PPPK', label: 'SK PPPK' });
            types.push({ type: 'SK_JABATAN', label: 'SK Jabatan' });
        }
        if (selectedEmployee.status !== 'Outsourcing') {
            types.push({ type: 'SKP', label: 'SKP (Sasaran Kinerja Pegawai)' });
        }

        return types;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (file.type !== 'application/pdf') {
            Swal.fire('Error', 'File harus berformat PDF', 'error');
            e.target.value = '';
            return;
        }

        // Validate file size (max 1MB)
        const maxSize = 1 * 1024 * 1024;
        if (file.size > maxSize) {
            Swal.fire('Error', 'Ukuran file maksimal 1MB', 'error');
            e.target.value = '';
            return;
        }

        setSelectedFile(file);
    };

    const generateFileName = () => {
        if (!selectedEmployee || !documentType) return '';

        const nip = selectedEmployee.nip;

        switch (documentType) {
            case 'SK_CPNS':
                return `sk_cpns_${nip}.pdf`;
            case 'SK_PNS':
                return `sk_pns_${nip}.pdf`;
            case 'SK_PPPK':
                return `sk_pppk_${nip}.pdf`;
            case 'SKP':
                return `skp_${nip}_${formData.tahunSKP || 'tahun'}.pdf`;
            case 'SK_JABATAN':
                return `sk_jabatan_${nip}.pdf`;
            default:
                return '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedEmployee || !documentType || !selectedFile) {
            Swal.fire('Error', 'Lengkapi semua field', 'error');
            return;
        }

        if (documentType === 'SKP' && (!formData.tahunSKP || !formData.predikat)) {
            Swal.fire('Error', 'Tahun SKP dan Predikat harus diisi', 'error');
            return;
        }

        if (documentType !== 'SKP' && (!formData.nomorSurat || !formData.tanggalSurat || !formData.tanggalMulai)) {
            Swal.fire('Error', 'Nomor Surat, Tanggal Surat, dan TMT harus diisi', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            const fileName = generateFileName();

            // Create FormData
            const formDataToSend = new FormData();
            formDataToSend.append('file', selectedFile);
            formDataToSend.append('employeeId', selectedEmployee.id);
            formDataToSend.append('documentType', documentType);

            if (documentType === 'SKP') {
                // SKP only needs tahunSKP and predikat
                formDataToSend.append('tahunSKP', formData.tahunSKP);
                formDataToSend.append('predikat', formData.predikat);
            } else {
                // SK documents need nomorSurat, tanggalSurat, tanggalMulai
                formDataToSend.append('nomorSurat', formData.nomorSurat);
                formDataToSend.append('tanggalSurat', formData.tanggalSurat);
                formDataToSend.append('tanggalMulai', formData.tanggalMulai);
            }

            formDataToSend.append('fileName', fileName);

            const result = await saveDocumentAction(formDataToSend);

            if ('error' in result) {
                Swal.fire('Error', result.error, 'error');
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Dokumen berhasil disimpan',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });

                // Reset form
                setFormData({
                    nomorSurat: '',
                    tanggalSurat: '',
                    tanggalMulai: '',
                    tahunSKP: '',
                    predikat: '',
                    positionId: ''
                });
                setSelectedFile(null);
                setShowForm(false);
                setDocumentType(null);

                // Reload page to refresh documents
                window.location.reload();
            }
        } catch (error) {
            Swal.fire('Error', 'Gagal menyimpan dokumen', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, fileName: string) => {
        const result = await Swal.fire({
            title: 'Hapus Dokumen?',
            text: `Dokumen ${fileName} akan dihapus permanen`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            const deleteResult = await deleteDocumentAction(id);

            if ('error' in deleteResult) {
                Swal.fire('Error', deleteResult.error, 'error');
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Terhapus',
                    text: 'Dokumen berhasil dihapus',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
                window.location.reload();
            }
        }
    };

    const groupedDocuments = documents.reduce((acc, doc) => {
        if (!acc[doc.documentType]) {
            acc[doc.documentType] = [];
        }
        acc[doc.documentType].push(doc);
        return acc;
    }, {} as Record<string, EmployeeDocument[]>);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white shadow-lg">
                <div className="flex items-center gap-3">
                    <FileText className="w-10 h-10" />
                    <div>
                        <h1 className="text-3xl font-black">Daftar Riwayat</h1>
                        <p className="text-green-100 mt-1">Kelola dokumen pegawai (SK & SKP)</p>
                    </div>
                </div>
            </div>

            {/* Employee Selector */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-3">
                    Pilih Pegawai
                </label>

                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Cari nama atau NIP pegawai..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900 font-medium mb-3"
                />

                {/* Employee Dropdown */}
                <select
                    value={selectedEmployee?.id || ''}
                    onChange={(e) => handleEmployeeChange(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900 font-bold"
                >
                    <option value="">-- Pilih Pegawai --</option>
                    {filteredEmployees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                            {emp.name} - {emp.nip} ({emp.status})
                        </option>
                    ))}
                </select>

                {searchTerm && filteredEmployees.length === 0 && (
                    <p className="text-sm text-red-500 mt-2">Tidak ada pegawai yang cocok dengan pencarian</p>
                )}

                {searchTerm && filteredEmployees.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                        Menampilkan {filteredEmployees.length} dari {employees.length} pegawai
                    </p>
                )}
            </div>

            {/* Document Type Selection */}
            {selectedEmployee && !showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-black text-gray-900 mb-4">Tambah Dokumen Baru</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getAvailableDocumentTypes().map(({ type, label }) => (
                            <button
                                key={type}
                                onClick={() => {
                                    setDocumentType(type);
                                    setShowForm(true);
                                }}
                                className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl transition-all group"
                            >
                                <Plus className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
                                <span className="font-bold text-gray-900">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Document Form */}
            {selectedEmployee && showForm && documentType && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-black text-gray-900">
                            Form {documentType.replace('_', ' ')}
                        </h2>
                        <button
                            onClick={() => {
                                setShowForm(false);
                                setDocumentType(null);
                                setFormData({
                                    nomorSurat: '',
                                    tanggalSurat: '',
                                    tanggalMulai: '',
                                    tahunSKP: '',
                                    predikat: '',
                                    positionId: ''
                                });
                                setSelectedFile(null);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            Batal
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {documentType !== 'SKP' && (
                            <>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                                        Nomor Surat
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nomorSurat}
                                        onChange={(e) => setFormData({ ...formData, nomorSurat: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900 font-medium"
                                        required
                                    />
                                </div>

                                {documentType === 'SK_JABATAN' && (
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                                            Nama Jabatan
                                        </label>
                                        <select
                                            value={formData.positionId}
                                            onChange={(e) => setFormData({ ...formData, positionId: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900 font-bold"
                                            required
                                        >
                                            <option value="">-- Pilih Jabatan --</option>
                                            {positions.map(pos => (
                                                <option key={pos.id} value={pos.id}>
                                                    {pos.namaJabatan} ({pos.jenisJabatan})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                                            Tanggal Surat
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.tanggalSurat}
                                            onChange={(e) => setFormData({ ...formData, tanggalSurat: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900 font-medium"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                                            Tanggal Mulai Tugas (TMT)
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.tanggalMulai}
                                            onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900 font-medium"
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {documentType === 'SKP' && (
                            <>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                                        Tahun SKP
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.tahunSKP}
                                        onChange={(e) => setFormData({ ...formData, tahunSKP: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900 font-medium"
                                        placeholder="Contoh: 2024"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                                        Predikat
                                    </label>
                                    <select
                                        value={formData.predikat}
                                        onChange={(e) => setFormData({ ...formData, predikat: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900 font-bold"
                                        required
                                    >
                                        <option value="">-- Pilih Predikat --</option>
                                        <option value="Sangat Baik">Sangat Baik</option>
                                        <option value="Baik">Baik</option>
                                        <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                                        <option value="Kurang">Kurang</option>
                                        <option value="Sangat Kurang">Sangat Kurang</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                                Upload File PDF (Max 1MB)
                            </label>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900 font-medium"
                                required
                            />
                            {selectedFile && (
                                <p className="text-xs text-green-600 mt-2 font-bold">
                                    File: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wide transition-all shadow-lg shadow-green-200 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    Simpan Dokumen
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            )}

            {/* Documents List */}
            {selectedEmployee && Object.keys(groupedDocuments).length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-black text-gray-900">Dokumen Tersimpan</h2>

                    {Object.entries(groupedDocuments).map(([type, docs]) => (
                        <div key={type} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-md font-black text-gray-700 mb-4">
                                {type.replace('_', ' ')}
                            </h3>
                            <div className="space-y-3">
                                {docs.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-4">
                                            <FileCheck className="w-5 h-5 text-green-600" />
                                            <div>
                                                {doc.documentType === 'SKP' ? (
                                                    <>
                                                        <p className="font-bold text-gray-900">SKP Tahun {doc.tahunSKP}</p>
                                                        <p className="text-xs text-gray-500">
                                                            Predikat: <span className="font-bold text-green-600">{doc.predikat}</span>
                                                        </p>
                                                    </>
                                                ) : doc.documentType === 'SK_JABATAN' ? (
                                                    <>
                                                        <p className="font-bold text-gray-900">{doc.position?.namaJabatan || 'Jabatan tidak ditemukan'}</p>
                                                        <p className="text-xs text-gray-500">
                                                            No: {doc.nomorSurat} | TMT: {doc.tanggalMulai ? new Date(doc.tanggalMulai).toLocaleDateString('id-ID') : '-'}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="font-bold text-gray-900">{doc.nomorSurat}</p>
                                                        <p className="text-xs text-gray-500">
                                                            Tanggal: {doc.tanggalSurat ? new Date(doc.tanggalSurat).toLocaleDateString('id-ID') : '-'}
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={doc.filePath}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Download className="w-5 h-5" />
                                            </a>
                                            <button
                                                onClick={() => handleDelete(doc.id, doc.fileName)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedEmployee && Object.keys(groupedDocuments).length === 0 && !showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold">Belum ada dokumen untuk pegawai ini</p>
                </div>
            )}
        </div>
    );
}
