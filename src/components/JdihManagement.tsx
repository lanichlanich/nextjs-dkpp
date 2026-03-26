"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    FileText,
    SearchX,
    FolderOpen,
    Download,
    Calendar,
    Hash,
    MoreHorizontal
} from "lucide-react";
import { JdihDocument } from "@/lib/jdih";
import { saveJdihAction, deleteJdihAction } from "@/actions/jdih";
import { JdihModal } from "./JdihModal";
import { StandardPagination } from "./ui/StandardPagination";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "./ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";

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
    const urlLimit = parseInt(searchParams.get("limit") || "10");
    const [itemsPerPage, setItemsPerPage] = useState(urlLimit);
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

    const handleLimitChange = (limit: number) => {
        setItemsPerPage(limit);
        setCurrentPage(1);
        const params = new URLSearchParams(searchParams.toString());
        params.set("limit", limit.toString());
        params.set("page", "1");
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

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState<JdihDocument | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const handleSave = async (data: FormData) => {
        setIsActionLoading(true);
        const result = await saveJdihAction(data);
        setIsActionLoading(false);

        if ("error" in result) {
            toast.error(result.error as string);
        } else {
            router.refresh();
            setIsModalOpen(false);
            toast.success("Dokumen JDIH berhasil disimpan");
        }
    };

    const confirmDelete = async () => {
        if (!documentToDelete) return;

        setIsActionLoading(true);
        const deleteResult = await deleteJdihAction(documentToDelete.id);
        setIsActionLoading(false);

        if (typeof deleteResult === "object" && "error" in deleteResult) {
            toast.error(deleteResult.error as string);
        } else {
            toast.success("Dokumen berhasil dihapus");
            router.refresh();
            setIsDeleteDialogOpen(false);
            setDocumentToDelete(null);
        }
    };

    const handleDeleteClick = (doc: JdihDocument) => {
        setDocumentToDelete(doc);
        setIsDeleteDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-5">
                    <div className="bg-blue-600/10 p-4 rounded-3xl border border-blue-200 shadow-sm transition-transform hover:rotate-3">
                        <FolderOpen className="w-10 h-10 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">JDIH Management</h1>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mt-2">DOKUMENTASI & INFORMASI HUKUM</p>
                    </div>
                </div>
                <Button
                    onClick={handleAdd}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-7 rounded-2xl shadow-2xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 group border-0 mt-4 sm:mt-0"
                >
                    <Plus className="w-6 h-6 mr-2 group-hover:rotate-90 transition-transform" />
                    TAMBAH DOKUMEN
                </Button>
            </div>

            <Card className="border-slate-200/60 shadow-xl overflow-hidden bg-white/80 backdrop-blur-sm rounded-3xl">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                        <div className="relative w-full md:max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                type="text"
                                placeholder="Cari judul atau nomor dokumen..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-12 pr-4 h-14 bg-slate-50/50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-900 font-bold placeholder:text-slate-400 border-2"
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            <Select
                                value={filterType}
                                onValueChange={(val: any) => {
                                    setFilterType(val === "all" ? "" : (val || ""));
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="h-14 w-full md:w-[200px] bg-white border-slate-200 rounded-2xl font-bold text-slate-700 border-2 focus:ring-4 focus:ring-blue-500/10 transition-all">
                                    <SelectValue placeholder="Semua Jenis" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
                                    <SelectItem value="all" className="font-bold py-3 rounded-xl cursor-pointer">Semua Jenis</SelectItem>
                                    {uniqueTypes.map(t => <SelectItem key={t} value={t} className="font-bold py-3 rounded-xl cursor-pointer">{t}</SelectItem>)}
                                </SelectContent>
                            </Select>

                            <Select
                                value={filterYear}
                                onValueChange={(val: any) => {
                                    setFilterYear(val === "all" ? "" : (val || ""));
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="h-14 w-full md:w-[150px] bg-white border-slate-200 rounded-2xl font-bold text-slate-700 border-2 focus:ring-4 focus:ring-blue-500/10 transition-all">
                                    <SelectValue placeholder="Semua Tahun" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
                                    <SelectItem value="all" className="font-bold py-3 rounded-xl cursor-pointer">Semua Tahun</SelectItem>
                                    {uniqueYears.map(y => <SelectItem key={y} value={y} className="font-bold py-3 rounded-xl cursor-pointer">{y}</SelectItem>)}
                                </SelectContent>
                            </Select>

                            {(searchTerm || filterType || filterYear) && (
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setFilterType("");
                                        setFilterYear("");
                                        setCurrentPage(1);
                                    }}
                                    className="text-xs font-black text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl px-4 h-14"
                                >
                                    RESET FILTER
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-inner bg-slate-50/30">
                        <Table>
                            <TableHeader className="bg-slate-100/50 border-b border-slate-200">
                                <TableRow>
                                    <TableHead className="pl-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 h-14">Dokumen</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">Identitas</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">Tahun</TableHead>
                                    <TableHead className="w-24 text-right pr-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence mode="popLayout">
                                    {currentItems.length > 0 ? (
                                        currentItems.map((doc, idx) => (
                                            <motion.tr
                                                key={doc.id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="group hover:bg-white transition-all border-b border-slate-100 last:border-0"
                                            >
                                                <TableCell className="pl-6 py-6 max-w-md">
                                                    <div className="flex gap-4">
                                                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110 shadow-sm">
                                                            <FileText className="w-6 h-6" />
                                                        </div>
                                                        <div className="flex flex-col justify-center">
                                                            <div className="font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug tracking-tight">
                                                                {doc.title}
                                                            </div>
                                                            <Badge variant="outline" className="w-fit text-[9px] font-black uppercase tracking-tighter mt-2 bg-white text-blue-600 border-blue-100 px-2 py-0 h-4">
                                                                {doc.type}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-2 text-xs font-black text-slate-700 italic">
                                                            <Hash className="w-3 h-3 text-slate-400" />
                                                            Nomor: {doc.number}
                                                        </div>
                                                        {doc.description && (
                                                            <div className="text-[11px] font-bold text-slate-400 line-clamp-1 group-hover:text-slate-500 transition-colors">
                                                                {doc.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-0 font-black px-3 rounded-lg shadow-sm">
                                                        <Calendar className="w-3 h-3 mr-1.5 opacity-60" />
                                                        {doc.year}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="pr-6 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger render={
                                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-lg border border-transparent hover:border-slate-200 transition-all">
                                                                <MoreHorizontal className="h-5 w-5 text-slate-400" />
                                                            </Button>
                                                        } />
                                                        <DropdownMenuContent align="end" className="w-48 rounded-2xl shadow-2xl border-slate-200 p-2">
                                                            {doc.filePath && (
                                                                <DropdownMenuItem render={<a href={doc.filePath} target="_blank" rel="noopener noreferrer" className="flex items-center w-full" />} className="font-bold py-3 rounded-xl cursor-pointer text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700">
                                                                    <Download className="mr-3 h-4 w-4" />
                                                                    Download / View
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem onClick={() => handleEdit(doc)} className="font-bold py-3 rounded-xl cursor-pointer">
                                                                <Edit className="mr-3 h-4 w-4 text-blue-600" />
                                                                Edit Dokumen
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteClick(doc)}
                                                                className="font-bold py-3 rounded-xl cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                                                            >
                                                                <Trash2 className="mr-3 h-4 w-4" />
                                                                Hapus Permanen
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-80 text-center">
                                                <div className="flex flex-col items-center justify-center space-y-4 opacity-40">
                                                    <div className="p-6 bg-slate-100 rounded-full">
                                                        <SearchX className="w-16 h-16 text-slate-300" />
                                                    </div>
                                                    <p className="text-slate-500 font-bold italic text-lg tracking-tight">
                                                        Tidak ada dokumen JDIH ditemukan.
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </div>

                    <div className="mt-8">
                        <StandardPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            totalItems={filteredDocuments.length}
                            itemsPerPage={itemsPerPage}
                            onLimitChange={handleLimitChange}
                            color="blue"
                        />
                    </div>
                </CardContent>
            </Card>

            <JdihModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                document={editingDocument}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="rounded-3xl border-slate-200 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black text-slate-900 tracking-tight leading-none">Hapus Dokumen JDIH?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-bold text-slate-500 mt-2">
                            Anda akan menghapus <span className="text-slate-900 font-black">"{documentToDelete?.title}"</span> secara permanen. Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3 mt-6">
                        <AlertDialogCancel className="rounded-2xl font-black border-2 border-slate-200 text-slate-600 hover:bg-slate-50 px-6 h-12">BATAL</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isActionLoading}
                            className="rounded-2xl font-black bg-rose-600 hover:bg-rose-700 text-white border-0 shadow-xl shadow-rose-200 px-8 h-12"
                        >
                            {isActionLoading ? "MENGHAPUS..." : "YA, HAPUS PERMANEN"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
