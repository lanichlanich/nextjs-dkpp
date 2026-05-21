"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Plus, Search, Trash2, Edit, Sprout, RotateCcw, Loader2, Calendar, FileText, Check } from "lucide-react";
import { AgricultureProduction } from "@/lib/agriculture";
import { saveAgricultureProductionAction, deleteAgricultureProductionAction } from "@/actions/agriculture";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { StandardPagination } from "./ui/StandardPagination";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
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
import { cn } from "@/lib/utils";

interface AgricultureManagementProps {
    initialData: AgricultureProduction[];
    canManage?: boolean;
}

export function AgricultureManagement({ initialData, canManage = true }: AgricultureManagementProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const formRef = useRef<HTMLDivElement>(null);

    const [dataList, setDataList] = useState<AgricultureProduction[]>(initialData);
    const [searchQuery, setSearchQuery] = useState("");
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Form state
    const [editId, setEditId] = useState<string | null>(null);
    const [tahun, setTahun] = useState<string>("");
    const [komoditas, setKomoditas] = useState<string>("");
    const [produksi, setProduksi] = useState<string>("");
    const [produktivitas, setProduktivitas] = useState<string>("");
    const [luasPanen, setLuasPanen] = useState<string>("");

    // Pagination state
    const urlPage = parseInt(searchParams.get("page") || "1");
    const [currentPage, setCurrentPage] = useState(urlPage);
    const urlLimit = parseInt(searchParams.get("limit") || "10");
    const [itemsPerPage, setItemsPerPage] = useState(urlLimit);

    // Delete dialog state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<AgricultureProduction | null>(null);

    // Sync with server-side prop updates
    useEffect(() => {
        setDataList(initialData);
    }, [initialData]);

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

    // Available years option
    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let y = currentYear + 1; y >= 2020; y--) {
            years.push(y);
        }
        return years;
    }, []);

    // List of commodities
    const commodityOptions = ["Padi", "Mangga", "Tebu", "Daging", "Telur"];

    const handleReset = () => {
        setEditId(null);
        setTahun("");
        setKomoditas("");
        setProduksi("");
        setProduktivitas("");
        setLuasPanen("");
    };

    const handleEdit = (record: AgricultureProduction) => {
        setEditId(record.id);
        setTahun(record.tahun.toString());
        setKomoditas(record.komoditas);
        setProduksi(record.produksi.toString());
        setProduktivitas(record.produktivitas !== null && record.produktivitas !== undefined ? record.produktivitas.toString() : "");
        setLuasPanen(record.luasPanen !== null && record.luasPanen !== undefined ? record.luasPanen.toString() : "");

        // Scroll to form nicely
        formRef.current?.scrollIntoView({ behavior: "smooth" });
        toast.info(`Mengedit data komoditas ${record.komoditas} tahun ${record.tahun}`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!tahun) {
            toast.error("Silakan pilih Tahun!");
            return;
        }
        if (!komoditas) {
            toast.error("Silakan pilih Komoditas!");
            return;
        }
        if (!produksi || isNaN(Number(produksi)) || Number(produksi) < 0) {
            toast.error("Jumlah produksi wajib diisi dengan angka positif!");
            return;
        }

        setIsActionLoading(true);

        const payload = {
            id: editId || undefined,
            tahun: parseInt(tahun),
            komoditas,
            produksi: parseFloat(produksi),
            produktivitas: produktivitas !== "" && !isNaN(Number(produktivitas)) ? parseFloat(produktivitas) : null,
            luasPanen: luasPanen !== "" && !isNaN(Number(luasPanen)) ? parseFloat(luasPanen) : null,
        };

        const result = await saveAgricultureProductionAction(payload);

        setIsActionLoading(false);

        if (result.error) {
            toast.error(result.error);
            return;
        }

        toast.success(editId ? "Data statistik berhasil diperbarui!" : "Data statistik baru berhasil disimpan!");
        handleReset();
        router.refresh();
    };

    const handleDeleteClick = (record: AgricultureProduction) => {
        setRecordToDelete(record);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!recordToDelete) return;

        setIsActionLoading(true);
        const result = await deleteAgricultureProductionAction(recordToDelete.id);
        setIsActionLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(`Data statistik ${recordToDelete.komoditas} tahun ${recordToDelete.tahun} berhasil dihapus!`);
            router.refresh();
        }

        setIsDeleteDialogOpen(false);
        setRecordToDelete(null);
    };

    const filteredData = useMemo(() => {
        return dataList.filter(item =>
            item.komoditas.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.tahun.toString().includes(searchQuery)
        );
    }, [dataList, searchQuery]);

    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Dynamic warning labels based on commodity choice
    const isLivestock = komoditas === "Daging" || komoditas === "Telur";

    return (
        <div className="space-y-8">
            {/* Form Section */}
            {canManage && (
                <div ref={formRef} className="scroll-mt-24">
                    <Card className="border-slate-200/60 shadow-xl overflow-hidden bg-white rounded-3xl">
                        <CardHeader className="bg-gradient-to-r from-emerald-600/90 to-green-600/90 text-white p-6 md:p-8">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                    <Sprout className="w-6 h-6 text-emerald-100" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl md:text-2xl font-extrabold tracking-tight">
                                        {editId ? "Form Edit Statistik Pertanian" : "Form Input Data Pertanian"}
                                    </CardTitle>
                                    <p className="text-emerald-100/90 text-xs md:text-sm font-semibold mt-1">
                                        {editId ? "Ubah nilai statistik sektoral pertanian di bawah ini" : "Masukkan data sektoral baru untuk komoditas pertanian"}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                    {/* Tahun */}
                                    <div className="flex flex-col space-y-2">
                                        <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            Tahun <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={tahun}
                                            onChange={(e) => setTahun(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm outline-none cursor-pointer"
                                        >
                                            <option value="">Pilih Tahun</option>
                                            {yearOptions.map(y => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Komoditas */}
                                    <div className="flex flex-col space-y-2">
                                        <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                            <Sprout className="w-3.5 h-3.5 text-slate-400" />
                                            Komoditas <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={komoditas}
                                            onChange={(e) => setKomoditas(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm outline-none cursor-pointer"
                                        >
                                            <option value="">Pilih Komoditas</option>
                                            {commodityOptions.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Jumlah Produksi */}
                                    <div className="flex flex-col space-y-2">
                                        <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                                            Produksi (Ton) <span className="text-rose-500">*</span>
                                        </label>
                                        <Input
                                            type="number"
                                            step="any"
                                            placeholder="Contoh: 1623459"
                                            value={produksi}
                                            onChange={(e) => setProduksi(e.target.value)}
                                            className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 font-bold"
                                        />
                                    </div>

                                    {/* Produktivitas */}
                                    <div className="flex flex-col space-y-2">
                                        <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                                            Produktivitas (Ton/Ha)
                                        </label>
                                        <Input
                                            type="number"
                                            step="any"
                                            placeholder={isLivestock ? "N/A" : "Contoh: 7.1"}
                                            value={produktivitas}
                                            onChange={(e) => setProduktivitas(e.target.value)}
                                            disabled={isLivestock}
                                            className={cn(
                                                "h-11 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 font-bold",
                                                isLivestock && "opacity-50 cursor-not-allowed bg-slate-100"
                                            )}
                                        />
                                        {isLivestock && (
                                            <span className="text-[10px] text-amber-600 font-semibold italic">Tidak berlaku untuk peternakan</span>
                                        )}
                                    </div>

                                    {/* Luas Panen */}
                                    <div className="flex flex-col space-y-2">
                                        <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                                            Luas Panen (Ha)
                                        </label>
                                        <Input
                                            type="number"
                                            step="any"
                                            placeholder={isLivestock ? "N/A" : "Contoh: 228000"}
                                            value={luasPanen}
                                            onChange={(e) => setLuasPanen(e.target.value)}
                                            disabled={isLivestock}
                                            className={cn(
                                                "h-11 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 font-bold",
                                                isLivestock && "opacity-50 cursor-not-allowed bg-slate-100"
                                            )}
                                        />
                                        {isLivestock && (
                                            <span className="text-[10px] text-amber-600 font-semibold italic">Tidak berlaku untuk peternakan</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleReset}
                                        className="h-11 border-slate-200 rounded-xl font-bold px-6 text-slate-600 hover:bg-slate-50"
                                    >
                                        <RotateCcw className="mr-2 h-4 w-4 text-slate-500" />
                                        Reset Form
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isActionLoading}
                                        className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 rounded-xl shadow-lg shadow-emerald-100 transition-all active:scale-95"
                                    >
                                        {isActionLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="mr-2 h-4 w-4" />
                                                {editId ? "Simpan Perubahan" : "Simpan Data Statistik"}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* List Table Section */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Daftar Statistik Pertanian</h2>
                        <p className="text-slate-500 text-xs font-semibold mt-1">Daftar lengkap data statistik sektoral yang tersimpan di sistem</p>
                    </div>
                    <div className="relative flex-grow max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <Input
                            type="text"
                            placeholder="Cari komoditas atau tahun..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-12 pr-4 h-11 bg-white border-slate-200/60 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 font-bold"
                        />
                    </div>
                </div>

                <Card className="border-slate-200/60 shadow-xl overflow-hidden bg-white rounded-3xl">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/85 border-b border-slate-200">
                                    <TableRow>
                                        <TableHead className="pl-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Tahun</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Komoditas</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Jumlah Produksi</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Produktivitas</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Luas Panen</TableHead>
                                        {canManage && (
                                            <TableHead className="w-32 text-right pr-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Aksi</TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence mode="popLayout">
                                        {currentItems.length > 0 ? (
                                            currentItems.map((item) => (
                                                <motion.tr
                                                    key={item.id}
                                                    layout
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="group hover:bg-slate-50/40 transition-colors border-b border-slate-100 last:border-0"
                                                >
                                                    <TableCell className="pl-6 py-4 font-black text-slate-900">{item.tahun}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={cn(
                                                                "rounded-lg font-black text-[9px] uppercase tracking-wider px-2.5 py-1 border-0 shadow-sm",
                                                                item.komoditas === "Padi" ? "bg-amber-100 text-amber-800" :
                                                                item.komoditas === "Mangga" ? "bg-orange-100 text-orange-850" :
                                                                item.komoditas === "Tebu" ? "bg-lime-100 text-lime-800" :
                                                                item.komoditas === "Daging" ? "bg-rose-100 text-rose-800" :
                                                                "bg-blue-100 text-blue-800"
                                                            )}
                                                        >
                                                            {item.komoditas}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-bold text-slate-700">
                                                        {item.produksi.toLocaleString("id-ID")} Ton
                                                    </TableCell>
                                                    <TableCell className="font-semibold text-slate-600">
                                                        {item.produktivitas !== null && item.produktivitas !== undefined ? (
                                                            `${item.produktivitas.toLocaleString("id-ID")} Ton/Ha`
                                                        ) : (
                                                            <span className="text-slate-400 font-normal italic">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-semibold text-slate-600">
                                                        {item.luasPanen !== null && item.luasPanen !== undefined ? (
                                                            `${item.luasPanen.toLocaleString("id-ID")} Ha`
                                                        ) : (
                                                            <span className="text-slate-400 font-normal italic">-</span>
                                                        )}
                                                    </TableCell>
                                                    {canManage && (
                                                        <TableCell className="text-right pr-6 py-4">
                                                            <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleEdit(item)}
                                                                    className="h-8 w-8 rounded-lg hover:bg-slate-100 text-indigo-600"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDeleteClick(item)}
                                                                    className="h-8 w-8 rounded-lg hover:bg-rose-50 text-rose-600"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                </motion.tr>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={canManage ? 6 : 5} className="h-64 text-center">
                                                    <div className="flex flex-col items-center justify-center space-y-3 opacity-60">
                                                        <div className="p-4 bg-slate-50 rounded-full">
                                                            <Sprout className="w-12 h-12 text-slate-300" />
                                                        </div>
                                                        <p className="text-slate-400 font-bold italic">
                                                            Tidak ada data statistik ditemukan.
                                                        </p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {totalPages > 1 && (
                    <StandardPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        totalItems={filteredData.length}
                        itemsPerPage={itemsPerPage}
                        onLimitChange={handleLimitChange}
                        color="green"
                    />
                )}
            </div>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="rounded-2xl border-slate-200">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black text-slate-900 tracking-tight">Hapus Data Statistik?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-bold text-slate-500">
                            Anda akan menghapus data statistik komoditas <span className="text-slate-900 font-black">{recordToDelete?.komoditas}</span> tahun <span className="text-slate-900 font-black">{recordToDelete?.tahun}</span> secara permanen. Tindakan ini tidak dapat dibatalkan.
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
