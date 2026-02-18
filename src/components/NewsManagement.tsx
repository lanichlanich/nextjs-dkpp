"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Edit, ChevronLeft, ChevronRight, Download, FileSpreadsheet, FileText, ArrowUpDown, Filter, Loader2 } from "lucide-react";
import { NewsItem } from "@/lib/news";
import { DeleteNewsButton } from "./DeleteNewsButton";
import { NewsModal } from "./NewsModal";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { StandardPagination } from "./ui/StandardPagination";
import { updateNewsStatusAction } from "@/actions/news";
import Swal from "sweetalert2";

interface NewsManagementProps {
    initialNews: NewsItem[];
    canManage?: boolean;
}

type SortField = "title" | "status" | "date";
type SortDirection = "asc" | "desc";

export function NewsManagement({ initialNews, canManage = true }: NewsManagementProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // State
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [sortField, setSortField] = useState<SortField>("date");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    const urlPage = parseInt(searchParams.get("page") || "1");
    const [currentPage, setCurrentPage] = useState(urlPage);
    const [itemsPerPage] = useState(10);

    // In NewsManagement, we might not need to sync initialNews if it's strictly props-driven, 
    // but for consistency with other components:
    // const [news, setNews] = useState(initialNews); // Not currently used, it uses processedNews based on initialNews directly

    // Sync URL with local pagination state
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
    const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
    const [isStatusSaving, setIsStatusSaving] = useState<string | null>(null);

    const handleStatusChange = async (id: string, status: string) => {
        setIsStatusSaving(id);

        const result = await updateNewsStatusAction(id, status);

        if ("error" in result) {
            Swal.fire("Error", result.error, "error");
        } else {
            router.refresh();
            setEditingStatusId(null);
            Swal.fire({
                icon: "success",
                title: "Updated",
                text: "Status berita berhasil diperbarui",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 2000
            });
        }
        setIsStatusSaving(null);
    };

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
                                        {isStatusSaving === item.id ? (
                                            <div className="flex justify-center">
                                                <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                                            </div>
                                        ) : editingStatusId === item.id ? (
                                            <select
                                                autoFocus
                                                value={item.status}
                                                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                                onBlur={() => setEditingStatusId(null)}
                                                className="text-xs font-bold text-gray-900 bg-gray-50 border border-green-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-green-500"
                                            >
                                                <option value="Published">Published</option>
                                                <option value="Draft">Draft</option>
                                                <option value="Archived">Archived</option>
                                            </select>
                                        ) : (
                                            <span
                                                onClick={() => setEditingStatusId(item.id)}
                                                className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full cursor-pointer hover:ring-2 hover:ring-offset-1 transition-all
                                                ${item.status === 'Published' ? 'bg-green-100 text-green-700 hover:ring-green-300' :
                                                        item.status === 'Draft' ? 'bg-yellow-100 text-yellow-700 hover:ring-yellow-300' :
                                                            'bg-gray-100 text-gray-600 hover:ring-gray-300'}`}>
                                                {item.status}
                                            </span>
                                        )}
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

                <StandardPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    totalItems={processedNews.length}
                    itemsPerPage={itemsPerPage}
                    color="green"
                />
            </div>

            <NewsModal
                isOpen={isModalOpen}
                onClose={closeModal}
                newsItem={selectedNews}
            />
        </div>
    );
}
