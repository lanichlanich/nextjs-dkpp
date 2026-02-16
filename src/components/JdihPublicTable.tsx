"use client";

import { useState } from "react";
import {
    Search,
    Download,
    FileText,
    ChevronLeft,
    ChevronRight,
    SearchX,
    Calendar,
    Hash
} from "lucide-react";
import { JdihDocument } from "@/lib/jdih";
import { motion, AnimatePresence } from "framer-motion";

interface JdihPublicTableProps {
    initialDocuments: JdihDocument[];
}

export function JdihPublicTable({ initialDocuments }: JdihPublicTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterYear, setFilterYear] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const uniqueTypes = Array.from(new Set(initialDocuments.map(d => d.type))).sort();
    const uniqueYears = Array.from(new Set(initialDocuments.map(d => d.year))).sort((a, b) => b.localeCompare(a));

    const filteredDocuments = initialDocuments.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.number.includes(searchTerm);
        const matchesType = filterType === "" || doc.type === filterType;
        const matchesYear = filterYear === "" || doc.year === filterYear;

        return matchesSearch && matchesType && matchesYear;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredDocuments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-xl group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-green-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Cari regulasi atau nomor keputusan..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all text-slate-900 font-bold"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-1.5 rounded-2xl">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-transparent px-3 py-2 text-sm font-black text-slate-600 outline-none cursor-pointer"
                        >
                            <option value="">Semua Jenis</option>
                            {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <div className="w-px h-6 bg-slate-200" />
                        <select
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            className="bg-transparent px-3 py-2 text-sm font-black text-slate-600 outline-none cursor-pointer"
                        >
                            <option value="">Semua Tahun</option>
                            {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    {(searchTerm || filterType || filterYear) && (
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setFilterType("");
                                setFilterYear("");
                                setCurrentPage(1);
                            }}
                            className="text-xs font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 p-2"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            <div className="relative overflow-x-auto rounded-3xl border border-slate-100 bg-white">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pernyataan Hukum / Produk Hukum</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Identitas</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {currentItems.length > 0 ? (
                            currentItems.map((doc, idx) => (
                                <motion.tr
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={doc.id}
                                    className="hover:bg-slate-50/50 transition-all group"
                                >
                                    <td className="px-8 py-6 max-w-2xl">
                                        <div className="flex gap-6">
                                            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 transition-all group-hover:scale-110 group-hover:rotate-3 shadow-sm group-hover:shadow-blue-100">
                                                <FileText className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900 group-hover:text-blue-600 transition-colors text-lg leading-tight mb-2">
                                                    {doc.title}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-green-100">
                                                        {doc.type}
                                                    </span>
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider rounded-lg border border-slate-200 flex items-center gap-1.5">
                                                        <Calendar className="w-3 h-3" />
                                                        {doc.year}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="inline-flex flex-col items-center">
                                            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 mb-2">
                                                <Hash className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <span className="text-sm font-black text-slate-700">No: {doc.number}</span>
                                            {doc.year && <span className="text-[10px] text-slate-400 font-bold">Thn {doc.year}</span>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        {doc.filePath ? (
                                            <a
                                                href={doc.filePath}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-95 group/btn"
                                            >
                                                <Download className="w-5 h-5 group-hover/btn:-translate-y-1 transition-transform" />
                                                Unduh PDF
                                            </a>
                                        ) : (
                                            <span className="text-slate-300 font-bold text-xs uppercase italic tracking-widest">Belum Tersedia</span>
                                        )}
                                    </td>
                                </motion.tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="px-8 py-24 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                            <SearchX className="w-10 h-10 text-slate-200" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-slate-900 font-black text-lg">Tidak Ada Dokumen</p>
                                            <p className="text-slate-400 text-sm">Coba sesuaikan kata kunci atau filter pencarian Anda</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <p className="hidden sm:block text-xs font-black text-slate-400 uppercase tracking-widest">
                        Data {indexOfFirstItem + 1} — {Math.min(indexOfLastItem, filteredDocuments.length)} Terpilih
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="w-12 h-12 flex items-center justify-center border border-slate-100 rounded-2xl hover:bg-white hover:shadow-lg disabled:opacity-20 transition-all"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-12 h-12 rounded-2xl font-black text-xs transition-all ${currentPage === i + 1
                                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-200'
                                        : 'bg-white text-slate-400 border border-slate-100 hover:border-blue-200'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="w-12 h-12 flex items-center justify-center border border-slate-100 rounded-2xl hover:bg-white hover:shadow-lg disabled:opacity-20 transition-all"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
