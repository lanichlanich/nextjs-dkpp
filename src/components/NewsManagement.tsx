"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Edit, Download, FileSpreadsheet, FileText, ArrowUpDown, Filter, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { NewsItem } from "@/lib/news";
import { DeleteNewsButton } from "./DeleteNewsButton";
import { NewsEditorOverlay } from "./NewsEditorOverlay";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { StandardPagination } from "./ui/StandardPagination";
import { updateNewsStatusAction } from "@/actions/news";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
    const urlLimit = parseInt(searchParams.get("limit") || "10");
    const [itemsPerPage, setItemsPerPage] = useState(urlLimit);

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

    const handleLimitChange = (limit: number) => {
        setItemsPerPage(limit);
        setCurrentPage(1);
        const params = new URLSearchParams(searchParams.toString());
        params.set("limit", limit.toString());
        params.set("page", "1");
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
            toast.error(result.error as string);
        } else {
            router.refresh();
            setEditingStatusId(null);
            toast.success("Status berita berhasil diperbarui");
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

    const closeOverlay = () => {
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
            <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-slate-900">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl shadow-inner border border-white/20">
                                <FileText className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-white tracking-tight">Manajemen Berita</h1>
                                <p className="text-emerald-200 mt-1 font-bold flex items-center gap-2">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    Publikasikan informasi terbaru DKPP Indramayu
                                </p>
                            </div>
                        </div>
                        {canManage && (
                            <Button
                                onClick={handleCreate}
                                size="lg"
                                className="bg-white text-emerald-700 hover:bg-slate-50 font-black px-8 py-6 rounded-2xl shadow-xl transition-all hover:scale-105"
                            >
                                <Plus className="mr-2 h-6 w-6" />
                                TAMBAH BERITA
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Search & Stats */}
                <Card className="lg:col-span-3 border-slate-200/60 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                    <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative group flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            <Input
                                type="text"
                                placeholder="Cari judul atau ringkasan berita..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-12 pr-4 h-12 bg-slate-50 border-slate-200/60 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-normal"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <Select
                                value={statusFilter}
                                onValueChange={(val: any) => {
                                    setStatusFilter(val || "All");
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="w-[160px] h-12 rounded-xl border-slate-200 bg-white font-bold text-xs ring-0 focus:ring-0">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                    <SelectItem value="All">Semua Status</SelectItem>
                                    <SelectItem value="Published">Published</SelectItem>
                                    <SelectItem value="Draft">Draft</SelectItem>
                                    <SelectItem value="Archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-sm">
                    <CardContent className="p-4 flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger render={
                                <Button variant="outline" className="flex-1 font-bold border-slate-200 text-slate-600 rounded-xl h-12">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            } />
                            <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-200 shadow-xl">
                                <DropdownMenuItem onClick={exportToExcel} className="font-bold cursor-pointer py-3 rounded-lg text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50">
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                    Export ke Excel
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={exportToPDF} className="font-bold cursor-pointer py-3 rounded-lg text-rose-600 focus:text-rose-700 focus:bg-rose-50">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Export ke PDF
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-slate-200/60 shadow-xl overflow-hidden bg-white">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                                <TableRow>
                                    <TableHead
                                        className="pl-6 text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer hover:text-emerald-600 transition-colors"
                                        onClick={() => handleSort("title")}
                                    >
                                        <div className="flex items-center gap-2">
                                            Judul Berita
                                            {sortField === "title" && (
                                                <ArrowUpDown className="w-3 h-3 text-emerald-500" />
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center cursor-pointer hover:text-emerald-600 transition-colors"
                                        onClick={() => handleSort("status")}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            Status
                                            {sortField === "status" && (
                                                <ArrowUpDown className="w-3 h-3 text-emerald-500" />
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer hover:text-emerald-600 transition-colors"
                                        onClick={() => handleSort("date")}
                                    >
                                        <div className="flex items-center gap-2">
                                            Tanggal
                                            {sortField === "date" && (
                                                <ArrowUpDown className="w-3 h-3 text-emerald-500" />
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-24 text-right pr-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence mode="popLayout">
                                    {currentItems.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-64 text-center">
                                                <div className="flex flex-col items-center justify-center space-y-3 opacity-60">
                                                    <div className="p-4 bg-slate-50 rounded-full">
                                                        <FileText className="w-12 h-12 text-slate-300" />
                                                    </div>
                                                    <p className="text-slate-400 font-bold italic">
                                                        {searchQuery ? "Tidak ada berita yang cocok dengan pencarian" : "Belum ada data berita"}
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        currentItems.map((item, index) => (
                                            <motion.tr
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="group hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0"
                                            >
                                                <TableCell className="pl-6 py-5">
                                                    <div>
                                                        <p className="font-black text-slate-900 tracking-tight text-sm uppercase line-clamp-1">
                                                            {item.title}
                                                        </p>
                                                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium italic">
                                                            {item.excerpt}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {isStatusSaving === item.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600 mx-auto" />
                                                    ) : editingStatusId === item.id ? (
                                                        <Select
                                                            value={item.status}
                                                            onValueChange={(val: any) => handleStatusChange(item.id, val || "")}
                                                        >
                                                            <SelectTrigger className="h-8 w-[120px] text-[10px] font-bold mx-auto">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Published">Published</SelectItem>
                                                                <SelectItem value="Draft">Draft</SelectItem>
                                                                <SelectItem value="Archived">Archived</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <Badge
                                                            onClick={() => setEditingStatusId(item.id)}
                                                            className={cn(
                                                                "rounded-md font-black text-[9px] uppercase tracking-tighter px-2 cursor-pointer transition-all hover:scale-110",
                                                                item.status === 'Published' && "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0",
                                                                item.status === 'Draft' && "bg-amber-100 text-amber-700 hover:bg-amber-200 border-0",
                                                                item.status === 'Archived' && "bg-slate-100 text-slate-700 hover:bg-slate-200 border-0"
                                                            )}
                                                        >
                                                            {item.status}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="inline-flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-md">
                                                        <span className="text-[10px] font-black text-slate-900">{item.date}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {canManage ? (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger render={
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-md border border-transparent hover:border-slate-200 transition-all">
                                                                        <MoreHorizontal className="h-4 w-4 text-slate-500" />
                                                                    </Button>
                                                                } />
                                                                <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl border-slate-200">
                                                                    <DropdownMenuItem onClick={() => handleEdit(item)} className="font-bold py-2 rounded-lg cursor-pointer">
                                                                        <Edit className="mr-2 h-4 w-4 text-indigo-600" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem className="p-0 h-auto">
                                                                        <DeleteNewsButton id={item.id} />
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        ) : (
                                                            <Badge variant="outline" className="text-[9px] font-black uppercase text-slate-400">ReadOnly</Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <StandardPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={processedNews.length}
                itemsPerPage={itemsPerPage}
                onLimitChange={handleLimitChange}
                color="green"
            />

            <NewsEditorOverlay
                isOpen={isModalOpen}
                onClose={closeOverlay}
                newsItem={selectedNews}
            />
        </div>
    );
}
