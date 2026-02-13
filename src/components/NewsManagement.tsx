"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Edit, ChevronLeft, ChevronRight, Download, FileSpreadsheet, FileText, ArrowUpDown, Filter } from "lucide-react";
import { NewsItem } from "@/lib/news";
import { DeleteNewsButton } from "./DeleteNewsButton";
import { NewsModal } from "./NewsModal";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface NewsManagementProps {
    initialNews: NewsItem[];
    canManage?: boolean;
}

type SortField = "title" | "status" | "date";
type SortDirection = "asc" | "desc";

export function NewsManagement({ initialNews, canManage = true }: NewsManagementProps) {
    // ... rest of component logic ...
    // (I will keep the search/filter/sort logic unchanged)
    // Adjusting the return statement below ...
    // State
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [sortField, setSortField] = useState<SortField>("date");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

    // Data Pipeline: Filter -> Sort -> Paginate
    const processedNews = useMemo(() => {
        let result = [...initialNews];

        // 1. Filter by Search Query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter((item) =>
                item.title.toLowerCase().includes(query) ||
                item.excerpt.toLowerCase().includes(query)
            );
        }

        // 2. Filter by Status
        if (statusFilter !== "All") {
            result = result.filter((item) => item.status === statusFilter);
        }

        // 3. Sort
        result.sort((a, b) => {
            let fieldA = a[sortField].toLowerCase();
            let fieldB = b[sortField].toLowerCase();

            if (sortField === "date") {
                fieldA = new Date(a.date).getTime().toString();
                fieldB = new Date(b.date).getTime().toString();
            }

            if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1;
            if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });

        return result;
    }, [initialNews, searchQuery, statusFilter, sortField, sortDirection]);

    // Pagination Logic
    const totalPages = Math.ceil(processedNews.length / itemsPerPage);
    const currentItems = processedNews.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const handleCreate = () => {
        setSelectedNews(null);
        setIsModalOpen(true);
    };

    const handleEdit = (news: NewsItem) => {
        setSelectedNews(news);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedNews(null);
    };

    // Export Excel
    const exportToExcel = () => {
        const dataToExport = processedNews.map(({ id, title, status, date, excerpt }) => ({
            ID: id,
            Judul: title,
            Status: status,
            Tanggal: date,
            Ringkasan: excerpt
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Berita");
        XLSX.writeFile(wb, `Berita_DKPP_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // Export PDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Laporan Manajemen Berita DKPP Indramayu", 14, 15);

        const tableBody = processedNews.map((item, index) => [
            index + 1,
            item.title,
            item.status,
            item.date
        ]);

        autoTable(doc, {
            head: [['No', 'Judul', 'Status', 'Tanggal']],
            body: tableBody,
            startY: 25,
        });

        doc.save(`Berita_DKPP_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manajemen Berita</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola publikasi dan informasi DKPP Indramayu.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={exportToExcel}
                        className="flex items-center px-4 py-2 border border-gray-200 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all hover-lift"
                        title="Export Excel"
                    >
                        <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                        Excel
                    </button>
                    <button
                        onClick={exportToPDF}
                        className="flex items-center px-4 py-2 border border-gray-200 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all hover-lift"
                        title="Export PDF"
                    >
                        <FileText className="w-4 h-4 mr-2 text-red-600" />
                        PDF
                    </button>
                    {canManage && (
                        <button
                            onClick={handleCreate}
                            className="flex items-center px-4 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all hover-lift active:scale-95 ml-2"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Tambah Berita
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white shadow-xl shadow-gray-100 rounded-2xl overflow-hidden border border-gray-100">
                {/* Search and Filters */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full max-w-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Cari berita..."
                            className="block w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm text-gray-900 bg-white"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm text-gray-900 bg-white min-w-[140px]"
                        >
                            <option value="All">Semua Status</option>
                            <option value="Published">Published</option>
                            <option value="Draft">Draft</option>
                            <option value="Archived">Archived</option>
                        </select>
                    </div>

                    <div className="ml-auto text-sm text-gray-500 font-medium whitespace-nowrap">
                        Menampilkan {currentItems.length} dari {processedNews.length} berita
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-green-600 transition-colors"
                                    onClick={() => handleSort("title")}
                                >
                                    <div className="flex items-center">
                                        Judul
                                        <ArrowUpDown className="w-3 h-3 ml-2" />
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-green-600 transition-colors"
                                    onClick={() => handleSort("status")}
                                >
                                    <div className="flex items-center">
                                        Status
                                        <ArrowUpDown className="w-3 h-3 ml-2" />
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-green-600 transition-colors"
                                    onClick={() => handleSort("date")}
                                >
                                    <div className="flex items-center">
                                        Tanggal
                                        <ArrowUpDown className="w-3 h-3 ml-2" />
                                    </div>
                                </th>
                                <th scope="col" className="relative px-6 py-4">
                                    <span className="sr-only">Aksi</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {currentItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-gray-900 line-clamp-1">{item.title}</div>
                                        <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{item.excerpt}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                      ${item.status === 'Published' ? 'bg-green-100 text-green-700' :
                                                item.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-600'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                        {item.date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {canManage ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <DeleteNewsButton id={item.id} />
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic text-xs">Read Only</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {currentItems.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500 text-sm">
                                        Tidak ada berita ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
                        <div className="hidden sm:block">
                            <p className="text-sm text-gray-700">
                                Menampilkan <span className="font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> sampai{" "}
                                <span className="font-semibold">{Math.min(currentPage * itemsPerPage, processedNews.length)}</span> dari{" "}
                                <span className="font-semibold">{processedNews.length}</span> berita
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${currentPage === i + 1
                                        ? "bg-green-600 text-white shadow-md shadow-green-200"
                                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <NewsModal
                isOpen={isModalOpen}
                onClose={closeModal}
                newsItem={selectedNews}
            />
        </div>
    );
}
