"use client";

import { useState, useEffect } from "react";
import {
    Search,
    Trash2,
    FileText,
    Download,
    Calendar,
    User,
    CheckSquare,
    Square,
    DownloadCloud,
    SearchX,
    Loader2
} from "lucide-react";
import { SptReport } from "@prisma/client";
import { deleteSptReport } from "@/actions/spt";
import { StandardPagination } from "./ui/StandardPagination";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface SptManagementProps {
    initialReports: SptReport[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export function SptManagement({ initialReports, pagination }: SptManagementProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
    const [selectedYear, setSelectedYear] = useState(searchParams.get("year") || "");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDownloading, setIsDownloading] = useState(false);

    // Get unique years from reports for filter
    const [years, setYears] = useState<string[]>([]);

    useEffect(() => {
        // In a real app, we might want to fetch all years from the server
        // For now, we'll just extract from current reports or hardcode a range
        const currentYear = new Date().getFullYear();
        const yearRange = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());
        setYears(yearRange);
    }, []);

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (searchTerm) params.set("search", searchTerm);
        else params.delete("search");

        if (selectedYear) params.set("year", selectedYear);
        else params.delete("year");

        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === initialReports.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(initialReports.map(r => r.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleDelete = async (id: string, name: string) => {
        const result = await Swal.fire({
            title: "Hapus Laporan SPT?",
            text: `Anda akan menghapus laporan SPT milik "${name}".`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal"
        });

        if (result.isConfirmed) {
            const res = await deleteSptReport(id);
            if (res.success) {
                Swal.fire("Berhasil", "Laporan berhasil dihapus", "success");
                router.refresh();
            } else {
                Swal.fire("Gagal", res.error, "error");
            }
        }
    };

    const handleMassDownload = async () => {
        if (selectedIds.length === 0) return;

        setIsDownloading(true);
        const zip = new JSZip();
        const selectedReports = initialReports.filter(r => selectedIds.includes(r.id));

        try {
            const downloadPromises = selectedReports.map(async (report) => {
                const response = await fetch(report.filePath);
                if (!response.ok) throw new Error(`Gagal mendownload ${report.fileName}`);
                const blob = await response.blob();
                zip.file(report.fileName, blob);
            });

            await Promise.all(downloadPromises);
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `SPT_Report_Batch_${new Date().toISOString().split('T')[0]}.zip`);

            Swal.fire({
                icon: "success",
                title: "Berhasil",
                text: `${selectedReports.length} file berhasil dikompres dan diunduh.`,
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000
            });
        } catch (error: any) {
            Swal.fire("Gagal", "Gagal mengunduh file: " + error.message, "error");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-2xl">
                        <FileText className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Laporan SPT</h1>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Manajemen Pelaporan Pajak Pegawai</p>
                    </div>
                </div>

                {selectedIds.length > 0 && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={handleMassDownload}
                        disabled={isDownloading}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-70"
                    >
                        {isDownloading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <DownloadCloud className="w-5 h-5" />
                        )}
                        Unduh Terpilih ({selectedIds.length})
                    </motion.button>
                )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-1 w-full gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama atau NIP..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900 font-bold"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
                        >
                            Cari
                        </button>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <select
                            value={selectedYear}
                            onChange={(e) => {
                                setSelectedYear(e.target.value);
                                // Trigger search automatically on select change
                                const params = new URLSearchParams(searchParams.toString());
                                if (e.target.value) params.set("year", e.target.value);
                                else params.delete("year");
                                params.set("page", "1");
                                router.push(`${pathname}?${params.toString()}`);
                            }}
                            className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-green-500 w-full md:w-40"
                        >
                            <option value="">Semua Tahun</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        {(searchTerm || selectedYear) && (
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedYear("");
                                    router.push(pathname);
                                }}
                                className="text-xs font-black text-red-500 uppercase tracking-widest hover:underline px-2 whitespace-nowrap"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 w-10">
                                    <button onClick={toggleSelectAll} className="text-gray-400 hover:text-green-600 transition-colors">
                                        {selectedIds.length === initialReports.length && initialReports.length > 0 ? (
                                            <CheckSquare className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <Square className="w-5 h-5" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pegawai</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Detail Laporan</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Waktu Kirim</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {initialReports.length > 0 ? (
                                initialReports.map((report, idx) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        key={report.id}
                                        className={`hover:bg-green-50/30 transition-colors group ${selectedIds.includes(report.id) ? 'bg-green-50/50' : ''}`}
                                    >
                                        <td className="px-6 py-4">
                                            <button onClick={() => toggleSelect(report.id)} className="text-gray-400 transition-colors">
                                                {selectedIds.includes(report.id) ? (
                                                    <CheckSquare className="w-5 h-5 text-green-600" />
                                                ) : (
                                                    <Square className="w-5 h-5" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                                                        {report.name}
                                                    </div>
                                                    <div className="text-xs font-medium text-gray-400">
                                                        NIP: {report.nip}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                                    <Calendar className="w-4 h-4 text-green-500" />
                                                    Tahun Pajak: {report.year}
                                                </div>
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                                    File: {report.fileName}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-xs font-bold text-gray-500">
                                                {new Date(report.createdAt).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <a
                                                    href={report.filePath}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                                    title="Unduh / Lihat PDF"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(report.id, report.name)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <SearchX className="w-12 h-12 text-gray-200" />
                                            <p className="text-gray-400 font-bold">Tidak ada laporan SPT ditemukan</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <StandardPagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                    totalItems={pagination.total}
                    itemsPerPage={pagination.limit}
                    color="green"
                />
            </div>
        </div>
    );
}
