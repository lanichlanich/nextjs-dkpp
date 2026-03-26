"use client";

import { useState, useEffect, useRef } from "react";
import { Position } from "@/lib/positions";
import { Briefcase, Plus, Pencil, Trash2, Search, FileUp, FileDown, Download, MoreHorizontal } from "lucide-react";
import { PositionModal } from "./PositionModal";
import { savePositionAction, deletePositionAction, importPositionsAction } from "@/actions/position-actions";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from 'xlsx';
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
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
import { StandardPagination } from "./ui/StandardPagination";

interface PositionManagementProps {
    initialPositions: Position[];
}

export function PositionManagement({ initialPositions }: PositionManagementProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [positions, setPositions] = useState<Position[]>(initialPositions);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Pagination
    const urlPage = parseInt(searchParams.get("page") || "1");
    const [currentPage, setCurrentPage] = useState(urlPage);
    const urlLimit = parseInt(searchParams.get("limit") || "10");
    const [itemsPerPage, setItemsPerPage] = useState(urlLimit);

    // Sync state with props when data is refreshed from server
    useEffect(() => {
        setPositions(initialPositions);
    }, [initialPositions]);

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

    const filteredPositions = positions.filter(pos =>
        pos.namaJabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pos.jenisJabatan.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPositions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPositions.length / itemsPerPage);

    const handleSearchChange = (val: string) => {
        setSearchTerm(val);
        setCurrentPage(1);
    };

    const handleAdd = () => {
        setSelectedPosition(null);
        setIsModalOpen(true);
    };

    const handleEdit = (position: Position) => {
        setSelectedPosition(position);
        setIsModalOpen(true);
    };

    const handleSave = async (data: Partial<Position>) => {
        try {
            const result = await savePositionAction(data as any);

            if ('error' in result) {
                toast.error(result.error as string);
                throw new Error(result.error as string);
            }

            toast.success(`Jabatan berhasil ${data.id ? 'diupdate' : 'ditambahkan'}`);
            router.refresh();
            setIsModalOpen(false);
        } catch (error: any) {
            console.error("Save error:", error);
        }
    };

    const confirmDelete = async () => {
        if (!positionToDelete) return;

        setIsActionLoading(true);
        const result = await deletePositionAction(positionToDelete.id);

        if ('error' in result) {
            toast.error(result.error as string);
        } else {
            toast.success("Jabatan berhasil dihapus");
            router.refresh();
        }
        setIsActionLoading(false);
        setIsDeleteDialogOpen(false);
        setPositionToDelete(null);
    };

    const handleDeleteClick = (position: Position) => {
        setPositionToDelete(position);
        setIsDeleteDialogOpen(true);
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
                toast.error("File Excel kosong atau tidak valid");
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
                toast.error("Tidak ada data valid untuk diimpor");
                return;
            }

            const loadingToast = toast.loading(`Mengimpor ${formattedData.length} data jabatan...`);

            const result = await importPositionsAction(formattedData);

            toast.dismiss(loadingToast);

            if ("error" in result) {
                toast.error(result.error as string);
            } else {
                toast.success("Data jabatan berhasil diimpor");
                window.location.reload();
            }
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl shadow-inner border border-white/20">
                                <Briefcase className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-white tracking-tight">Daftar Jabatan</h1>
                                <p className="text-indigo-200 mt-1 font-bold flex items-center gap-2">
                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                                    Total {positions.length} jabatan terdaftar dalam sistem
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={handleAdd}
                            size="lg"
                            className="bg-white text-indigo-700 hover:bg-slate-50 font-black px-8 py-6 rounded-2xl shadow-xl transition-all hover:scale-105"
                        >
                            <Plus className="mr-2 h-6 w-6" />
                            TAMBAH JABATAN
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Search & Stats */}
                <Card className="lg:col-span-3 border-slate-200/60 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <Input
                                type="text"
                                placeholder="Cari nama jabatan atau jenis..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-12 pr-4 h-12 bg-slate-50 border-slate-200/60 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-normal"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-sm">
                    <CardContent className="p-4 flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger render={
                                <Button variant="outline" className="flex-1 font-bold border-slate-200 text-slate-600 rounded-xl h-12">
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Opsi Data
                                </Button>
                            } />
                            <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-200 shadow-xl">
                                <DropdownMenuItem onClick={handleExportExcel} className="font-bold cursor-pointer py-3 rounded-lg text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50">
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Export ke Excel
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="font-bold cursor-pointer py-3 rounded-lg text-indigo-600 focus:text-indigo-700 focus:bg-indigo-50">
                                    <FileUp className="mr-2 h-4 w-4" />
                                    Import Excel
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDownloadTemplate} className="font-bold cursor-pointer py-3 rounded-lg text-slate-600 focus:text-slate-700 focus:bg-slate-50">
                                    <Download className="mr-2 h-4 w-4" />
                                    Unduh Template
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImportExcel}
                            accept=".xlsx, .xls"
                            className="hidden"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Table Container */}
            <Card className="border-slate-200/60 shadow-xl overflow-hidden bg-white">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                                <TableRow>
                                    <TableHead className="w-16 pl-6 text-[10px] font-black uppercase tracking-widest text-slate-500">No</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nama Jabatan</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Jenis</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Detail (Eselon/Jenjang)</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">BUP</TableHead>
                                    <TableHead className="w-24 text-right pr-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence mode="popLayout">
                                    {filteredPositions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-64 text-center">
                                                <div className="flex flex-col items-center justify-center space-y-3 opacity-60">
                                                    <div className="p-4 bg-slate-50 rounded-full">
                                                        <Briefcase className="w-12 h-12 text-slate-300" />
                                                    </div>
                                                    <p className="text-slate-400 font-bold italic">
                                                        {searchTerm ? "Tidak ada jabatan yang cocok dengan pencarian" : "Belum ada data jabatan terdaftar"}
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        currentItems.map((position, index) => (
                                            <motion.tr
                                                key={position.id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="group hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0"
                                            >
                                                <TableCell className="pl-6 font-bold text-slate-400 text-xs">
                                                    {indexOfFirstItem + index + 1}
                                                </TableCell>
                                                <TableCell className="py-5">
                                                    <p className="font-black text-slate-900 tracking-tight text-sm uppercase">
                                                        {position.namaJabatan}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant={
                                                            position.jenisJabatan === 'Struktural' ? 'default' :
                                                                position.jenisJabatan === 'Fungsional' ? 'success' : 'warning'
                                                        }
                                                        className={cn(
                                                            "rounded-md font-black text-[9px] uppercase tracking-tighter px-2",
                                                            position.jenisJabatan === 'Struktural' && "bg-indigo-100 text-indigo-700 hover:bg-indigo-100",
                                                            position.jenisJabatan === 'Fungsional' && "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0",
                                                            position.jenisJabatan === 'Pelaksana' && "bg-amber-100 text-amber-700 hover:bg-amber-100 border-0"
                                                        )}
                                                    >
                                                        {position.jenisJabatan}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-slate-600 font-bold text-xs italic">
                                                    {getDetailColumn(position)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                                                        <span className="font-black text-slate-900 text-xs">{position.batasUsiaPensiun}</span>
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Thn</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger render={
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-md border border-transparent hover:border-slate-200 transition-all">
                                                                <MoreHorizontal className="h-4 w-4 text-slate-500" />
                                                            </Button>
                                                        } />
                                                        <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl border-slate-200">
                                                            <DropdownMenuItem onClick={() => handleEdit(position)} className="font-bold py-2 rounded-lg cursor-pointer">
                                                                <Pencil className="mr-2 h-4 w-4 text-indigo-600" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteClick(position)}
                                                                className="font-bold py-2 rounded-lg cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Hapus
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
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
                totalItems={filteredPositions.length}
                itemsPerPage={itemsPerPage}
                onLimitChange={handleLimitChange}
            />

            {/* Modal */}
            <PositionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                position={selectedPosition}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="rounded-2xl border-slate-200">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black text-slate-900 tracking-tight">Hapus Jabatan?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-bold text-slate-500">
                            Anda akan menghapus jabatan <span className="text-slate-900 font-black">{positionToDelete?.namaJabatan}</span> secara permanen. Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 mt-4">
                        <AlertDialogCancel className="rounded-xl font-bold border-slate-200 text-slate-600">Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isActionLoading}
                            className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white border-0 shadow-lg"
                        >
                            {isActionLoading ? "Menghapus..." : "Ya, Hapus Permanen"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
