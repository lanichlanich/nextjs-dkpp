"use client";

import { useState } from "react";
import { Position } from "@/lib/positions";
import { Briefcase, Plus, Pencil, Trash2, Search } from "lucide-react";
import { PositionModal } from "./PositionModal";
import { savePositionAction, deletePositionAction, importPositionsAction } from "@/actions/position-actions";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import * as XLSX from 'xlsx';
import { useRef } from "react";
import { FileUp, FileDown, Download } from "lucide-react";

interface PositionManagementProps {
    initialPositions: Position[];
}

export function PositionManagement({ initialPositions }: PositionManagementProps) {
    const [positions, setPositions] = useState<Position[]>(initialPositions);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredPositions = positions.filter(pos =>
        pos.namaJabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pos.jenisJabatan.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = () => {
        setSelectedPosition(null);
        setIsModalOpen(true);
    };

    const handleEdit = (position: Position) => {
        setSelectedPosition(position);
        setIsModalOpen(true);
    };

    const handleSave = async (data: Partial<Position>) => {
        const result = await savePositionAction(data as any);

        if ('error' in result) {
            Swal.fire("Error", result.error, "error");
            throw new Error(result.error);
        }

        Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: `Jabatan berhasil ${data.id ? 'diupdate' : 'ditambahkan'}`,
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000
        });

        window.location.reload();
    };

    const handleDelete = async (position: Position) => {
        const result = await Swal.fire({
            title: "Hapus Jabatan?",
            text: `Jabatan "${position.namaJabatan}" akan dihapus permanen`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal"
        });

        if (result.isConfirmed) {
            const deleteResult = await deletePositionAction(position.id);

            if ('error' in deleteResult) {
                Swal.fire("Error", deleteResult.error, "error");
            } else {
                Swal.fire({
                    icon: "success",
                    title: "Terhapus",
                    text: "Jabatan berhasil dihapus",
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 3000
                });
                window.location.reload();
            }
        }
    };

    const getDetailColumn = (position: Position) => {
        switch (position.jenisJabatan) {
            case 'Struktural':
                return position.eselon || '-';
            case 'Fungsional':
                return position.jenjangFungsional || '-';
            case 'Pelaksana':
                return position.jenisPelaksana || '-';
            default:
                return '-';
        }
    };

    const handleExportExcel = () => {
        const dataToExport = positions.map((pos, index) => ({
            No: index + 1,
            "Nama Jabatan": pos.namaJabatan,
            "Jenis Jabatan": pos.jenisJabatan,
            "Eselon": pos.eselon || "-",
            "Jenjang Fungsional": pos.jenjangFungsional || "-",
            "Jenis Pelaksana": pos.jenisPelaksana || "-",
            "Batas Usia Pensiun": pos.batasUsiaPensiun
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Daftar Jabatan");
        XLSX.writeFile(wb, "Daftar_Jabatan_DKPP.xlsx");
    };

    const handleDownloadTemplate = () => {
        const templateData = [
            {
                "Nama Jabatan": "Contoh Jabatan Struktural",
                "Jenis Jabatan": "Struktural",
                "Eselon": "III.a",
                "Jenjang Fungsional": "",
                "Jenis Pelaksana": "",
                "Batas Usia Pensiun": 58
            },
            {
                "Nama Jabatan": "Contoh Jabatan Fungsional",
                "Jenis Jabatan": "Fungsional",
                "Eselon": "",
                "Jenjang Fungsional": "Ahli Muda",
                "Jenis Pelaksana": "",
                "Batas Usia Pensiun": 60
            }
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "Template_Import_Jabatan.xlsx");
    };

    const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const data = new Uint8Array(event.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

            if (jsonData.length === 0) {
                Swal.fire("Error", "File Excel kosong atau tidak valid", "error");
                return;
            }

            const formattedData = jsonData.map(item => ({
                namaJabatan: item["Nama Jabatan"] || item.namaJabatan,
                jenisJabatan: item["Jenis Jabatan"] || item.jenisJabatan,
                eselon: item["Eselon"] || item.eselon,
                jenjangFungsional: item["Jenjang Fungsional"] || item.jenjangFungsional,
                jenisPelaksana: item["Jenis Pelaksana"] || item.jenisPelaksana,
                batasUsiaPensiun: Number(item["Batas Usia Pensiun"] || item.batasUsiaPensiun || 58)
            })).filter(item => item.namaJabatan && item.jenisJabatan);

            if (formattedData.length === 0) {
                Swal.fire("Error", "Tidak ada data valid untuk diimpor", "error");
                return;
            }

            Swal.fire({
                title: "Mengimpor Data...",
                html: `Sedang mengimpor <b>${formattedData.length}</b> data jabatan.`,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const result = await importPositionsAction(formattedData);

            if ("error" in result) {
                Swal.fire("Error", result.error, "error");
            } else {
                window.location.reload();
            }
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Briefcase className="w-10 h-10" />
                        <div>
                            <h1 className="text-3xl font-black">Daftar Jabatan</h1>
                            <p className="text-blue-100 mt-1">Kelola data jabatan organisasi</p>
                        </div>
                    </div>
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wide hover:bg-blue-50 transition-all shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Tambah Jabatan
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari nama jabatan atau jenis..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 font-medium"
                    />
                </div>
                {searchTerm && (
                    <p className="text-xs text-gray-500 mt-2">
                        Menampilkan {filteredPositions.length} dari {positions.length} jabatan
                    </p>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl font-bold hover:bg-green-100 transition-all border border-green-200"
                >
                    <FileDown className="w-4 h-4" />
                    Export Excel
                </button>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-all border border-blue-200"
                >
                    <FileUp className="w-4 h-4" />
                    Import Excel
                </button>
                <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all border border-gray-200"
                >
                    <Download className="w-4 h-4" />
                    Download Template
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImportExcel}
                    accept=".xlsx, .xls"
                    className="hidden"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-widest">
                                    No
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-widest">
                                    Nama Jabatan
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-widest">
                                    Jenis
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-widest">
                                    Eselon/Jenjang/Jenis
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-widest">
                                    Batas Pensiun
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-black text-gray-600 uppercase tracking-widest">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPositions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p className="font-bold">
                                            {searchTerm ? "Tidak ada jabatan yang cocok" : "Belum ada data jabatan"}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredPositions.map((position, index) => (
                                    <motion.tr
                                        key={position.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-blue-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-bold">
                                            {position.namaJabatan}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black ${position.jenisJabatan === 'Struktural' ? 'bg-purple-100 text-purple-700' :
                                                position.jenisJabatan === 'Fungsional' ? 'bg-green-100 text-green-700' :
                                                    'bg-orange-100 text-orange-700'
                                                }`}>
                                                {position.jenisJabatan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                                            {getDetailColumn(position)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 font-bold">
                                            {position.batasUsiaPensiun} Tahun
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(position)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(position)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <PositionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                position={selectedPosition}
            />
        </div>
    );
}
