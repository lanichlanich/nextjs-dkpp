"use client";

import { useState } from "react";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    FileText,
    ChevronLeft,
    ChevronRight,
    SearchX,
    FolderOpen,
    Download,
    Calendar,
    Hash
} from "lucide-react";
import { JdihDocument } from "@/lib/jdih";
import { saveJdihAction, deleteJdihAction } from "@/actions/jdih";
import { JdihModal } from "./JdihModal";
import { StandardPagination } from "./ui/StandardPagination";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect } from "react";

interface JdihManagementProps {
    initialDocuments: JdihDocument[];
}

export function JdihManagement({ initialDocuments }: JdihManagementProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [documents, setDocuments] = useState<JdihDocument[]>(initialDocuments);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState<JdihDocument | null>(null);

    // Pagination & Filtering
    const urlPage = parseInt(searchParams.get("page") || "1");
    const [currentPage, setCurrentPage] = useState(urlPage);
    const [itemsPerPage] = useState(10);
    const [filterType, setFilterType] = useState("");
    const [filterYear, setFilterYear] = useState("");

    // Sync state with props when data is refreshed from server
    useEffect(() => {
        setDocuments(initialDocuments);
    }, [initialDocuments]);

    // Sync URL with local pagination state
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const uniqueTypes = Array.from(new Set(documents.map(d => d.type))).sort();
    const uniqueYears = Array.from(new Set(documents.map(d => d.year))).sort((a, b) => b.localeCompare(a));

    const filteredDocuments = documents.filter(doc => {
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

    const handleAdd = () => {
        setEditingDocument(null);
        setIsModalOpen(true);
    };

    const handleEdit = (doc: JdihDocument) => {
        setEditingDocument(doc);
        setIsModalOpen(true);
    };

    const handleSave = async (data: FormData) => {
        const result = await saveJdihAction(data);

        if ("error" in result) {
            Swal.fire("Error", result.error, "error");
        } else {
            router.refresh();
            setIsModalOpen(false);
            Swal.fire({
                icon: "success",
                title: "Berhasil",
                text: "Dokumen JDIH berhasil disimpan",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000
            });
        }
    };

    const handleDelete = async (id: string, title: string) => {
        const result = await Swal.fire({
            title: "Hapus Dokumen?",
            text: `Anda akan menghapus "${title}". Tindakan ini tidak dapat dibatalkan.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, Hapus!",
            cancelButtonText: "Batal"
        });

        if (result.isConfirmed) {
            const deleteResult = await deleteJdihAction(id);
            if (typeof deleteResult === "object" && "error" in deleteResult) {
                Swal.fire("Error", deleteResult.error, "error");
            } else {
                router.refresh();
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-2xl">
                        <FolderOpen className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manajemen JDIH</h1>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Produk Hukum & Dokumen Digital</p>
                    </div>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    Tambah Dokumen
                </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari judul atau nomor..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 font-bold"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={filterType}
                            onChange={(e) => {
                                setFilterType(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Semua Jenis</option>
                            {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <select
                            value={filterYear}
                            onChange={(e) => {
                                setFilterYear(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Semua Tahun</option>
                            {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        {(searchTerm || filterType || filterYear) && (
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setFilterType("");
                                    setFilterYear("");
                                    setCurrentPage(1);
                                }}
                                className="text-xs font-black text-red-500 uppercase tracking-widest hover:underline px-2"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Dokumen</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Identitas</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Tahun</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {currentItems.length > 0 ? (
                                currentItems.map((doc, idx) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={doc.id}
                                        className="hover:bg-gray-50 transition-colors group"
                                    >
                                        <td className="px-6 py-5 max-w-md">
                                            <div className="flex gap-4">
                                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                                                        {doc.title}
                                                    </div>
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">
                                                        {doc.type}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                                    <Hash className="w-4 h-4 text-gray-400" />
                                                    No: {doc.number}
                                                </div>
                                                {doc.description && (
                                                    <div className="text-xs text-gray-400 italic line-clamp-1">{doc.description}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {doc.year}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {doc.filePath && (
                                                    <a
                                                        href={doc.filePath}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Download / View"
                                                    >
                                                        <Download className="w-5 h-5" />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => handleEdit(doc)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(doc.id, doc.title)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <SearchX className="w-12 h-12 text-gray-200" />
                                            <p className="text-gray-400 font-bold">Tidak ada dokumen ditemukan</p>
                                        </div>
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
                    totalItems={filteredDocuments.length}
                    itemsPerPage={itemsPerPage}
                />
            </div>

            <JdihModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                document={editingDocument}
            />
        </div>
    );
}
