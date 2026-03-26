"use client";

import { useState } from "react";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Briefcase,
    MapPin,
    Calendar,
    Users,
    ChevronLeft,
    ChevronRight,
    FileDown,
    FileUp,
    FileText,
    Download,
    ShieldCheck,
    Hash,
    Loader2
} from "lucide-react";
import { Employee, EmployeeDisplay } from "@/lib/employees";
import { Position } from "@/lib/positions";
import { saveEmployeeAction, deleteEmployeeAction, importEmployeesAction, bulkUpdateEmployeesAction } from "@/actions/employees";
import { EmployeeModal } from "./EmployeeModal";
import { EmployeeHistoryOverlay } from "./EmployeeHistoryOverlay";
import { EmployeeDocument } from "@/lib/history";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { StandardPagination } from "./ui/StandardPagination";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface EmployeeManagementProps {
    initialEmployees: EmployeeDisplay[];
    initialDocuments: EmployeeDocument[];
    positions: Position[];
}

export function EmployeeManagement({ initialEmployees, initialDocuments, positions }: EmployeeManagementProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [employees, setEmployees] = useState<EmployeeDisplay[]>(initialEmployees);
    const [editingKeaktifanId, setEditingKeaktifanId] = useState<string | null>(null);
    const [isKeaktifanSaving, setIsKeaktifanSaving] = useState<string | null>(null);
    const [editingGenderId, setEditingGenderId] = useState<string | null>(null);
    const [isGenderSaving, setIsGenderSaving] = useState<string | null>(null);
    const [editingPositionId, setEditingPositionId] = useState<string | null>(null);
    const [isPositionSaving, setIsPositionSaving] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);
    const [activeBulkField, setActiveBulkField] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<EmployeeDisplay | null>(null);
    const [historyEmployee, setHistoryEmployee] = useState<EmployeeDisplay | null>(null);
    const [employeeToDelete, setEmployeeToDelete] = useState<{ id: string, name: string } | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // New state for pagination, sorting, and filtering
    const urlPage = parseInt(searchParams.get("page") || "1");
    const [currentPage, setCurrentPage] = useState(urlPage);

    // Sync state with props when data is refreshed from server
    useEffect(() => {
        setEmployees(initialEmployees);
    }, [initialEmployees]);

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
    const urlLimit = parseInt(searchParams.get("limit") || "10");
    const [itemsPerPage, setItemsPerPage] = useState(urlLimit);
    const [sortField, setSortField] = useState<"name" | "nip">("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [filterGender, setFilterGender] = useState("");
    const [filterBirthPlace, setFilterBirthPlace] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterKeaktifan, setFilterKeaktifan] = useState("");
    const [filterGolongan, setFilterGolongan] = useState("");

    // Get unique birthplaces for filter
    const uniqueBirthPlaces = Array.from(new Set(employees.map(e => e.birthPlace))).sort();

    // 1. Filter logic
    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.nip.includes(searchTerm);
        const matchesGender = filterGender === "" || emp.gender === filterGender;
        const matchesBirthPlace = filterBirthPlace === "" || emp.birthPlace === filterBirthPlace;
        const matchesStatus = filterStatus === "" || emp.status === filterStatus;
        const matchesKeaktifan = filterKeaktifan === "" || emp.keaktifan === filterKeaktifan;
        const matchesGolongan = filterGolongan === "" || emp.golongan === filterGolongan;

        return matchesSearch && matchesGender && matchesBirthPlace && matchesStatus && matchesKeaktifan && matchesGolongan;
    });

    // 2. Sort logic
    const sortedEmployees = [...filteredEmployees].sort((a, b) => {
        const valA = a[sortField].toLowerCase();
        const valB = b[sortField].toLowerCase();

        if (sortOrder === "asc") {
            return valA < valB ? -1 : 1;
        } else {
            return valA > valB ? -1 : 1;
        }
    });

    // 3. Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedEmployees.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);

    const handleAdd = () => {
        setEditingEmployee(null);
        setIsModalOpen(true);
    };

    const handleEdit = (employee: EmployeeDisplay) => {
        setEditingEmployee(employee);
        setIsModalOpen(true);
    };

    const handleKeaktifanChange = async (id: string, keaktifan: string) => {
        setIsKeaktifanSaving(id);
        const result = await saveEmployeeAction({ id, keaktifan });

        if ("error" in result) {
            toast.error(result.error as string);
        } else {
            router.refresh();
            setEditingKeaktifanId(null);
            toast.success("Keaktifan berhasil diperbarui");
        }
        setIsKeaktifanSaving(null);
    };

    const handleGenderChange = async (id: string, gender: string) => {
        setIsGenderSaving(id);
        const result = await saveEmployeeAction({ id, gender });

        if ("error" in result) {
            toast.error(result.error as string);
        } else {
            router.refresh();
            setEditingGenderId(null);
            toast.success("Jenis Kelamin berhasil diperbarui");
        }
        setIsGenderSaving(null);
    };

    const handlePositionChange = async (id: string, positionId: string) => {
        setIsPositionSaving(id);
        const result = await saveEmployeeAction({ id, positionId });

        if ("error" in result) {
            toast.error(result.error as string);
        } else {
            router.refresh();
            setEditingPositionId(null);
            toast.success("Jabatan berhasil diperbarui");
        }
        setIsPositionSaving(null);
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === currentItems.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(currentItems.map(emp => emp.id));
        }
    };

    const handleBulkUpdate = async (data: Partial<Employee>, label: string) => {
        if (selectedIds.length === 0) return;

        setIsBulkUpdating(true);
        const updateResult = await bulkUpdateEmployeesAction(selectedIds, data);

        if ("error" in updateResult) {
            toast.error(updateResult.error as string);
        } else {
            router.refresh();
            setSelectedIds([]);
            setActiveBulkField("");
            toast.success(`${selectedIds.length} pegawai berhasil diperbarui`);
        }
        setIsBulkUpdating(false);
    };

    const handleSave = async (data: Partial<Employee>) => {
        const result = await saveEmployeeAction(data);

        if ("error" in result) {
            toast.error(result.error as string);
        } else {
            router.refresh();
            setIsModalOpen(false);
            toast.success("Data pegawai berhasil disimpan");
        }
    };

    const confirmDelete = async () => {
        if (!employeeToDelete) return;

        const result = await deleteEmployeeAction(employeeToDelete.id);
        if (typeof result === "object" && "error" in result) {
            toast.error(result.error as string);
        } else {
            toast.success("Pegawai berhasil dihapus");
            router.refresh();
        }
        setIsDeleteDialogOpen(false);
        setEmployeeToDelete(null);
    };

    const handleDelete = (id: string, name: string) => {
        setEmployeeToDelete({ id, name });
        setIsDeleteDialogOpen(true);
    };

    const handleExportExcel = () => {
        const dataToExport = sortedEmployees.map(emp => ({
            Nama: emp.name,
            NIP: emp.nip,
            "Tempat Lahir": emp.birthPlace,
            "Tanggal Lahir": emp.birthDate,
            "Jenis Kelamin": emp.gender,
            Status: emp.status,
            Golongan: emp.golongan,
            Keaktifan: emp.keaktifan,
            Jabatan: emp.position?.namaJabatan || '-'
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Pegawai");
        XLSX.writeFile(wb, "Daftar_Pegawai_DKPP.xlsx");

        toast.success("Data berhasil diekspor ke Excel");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Daftar Pegawai DKPP Kabupaten Indramayu", 14, 15);

        const tableData = sortedEmployees.map((emp, index) => [
            index + 1,
            emp.name,
            emp.nip,
            emp.birthPlace,
            emp.birthDate,
            emp.status,
            emp.golongan,
            emp.keaktifan,
            emp.position?.namaJabatan || '-'
        ]);

        autoTable(doc, {
            head: [['No', 'Nama', 'NIP', 'Tempat Lahir', 'Tgl Lahir', 'Status', 'Gol', 'Keaktifan', 'Jabatan']],
            body: tableData,
            startY: 20,
            theme: 'grid',
            headStyles: { fillColor: [22, 101, 52] }
        });

        doc.save("Daftar_Pegawai_DKPP.pdf");
        toast.success("Data berhasil diekspor ke PDF");
    };

    const handleDownloadTemplate = () => {
        const templateData = [
            {
                Nama: "Contoh Nama",
                NIP: "199001152015011002",
                "Tempat Lahir": "Indramayu",
                Status: "PNS",
                Keaktifan: "Aktif",
                Golongan: "III/a",
                Jabatan: "Analis Kepegawaian"
            }
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "Template_Import_Pegawai.xlsx");
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
                name: item.Nama || item.nama,
                nip: String(item.NIP || item.nip || ""),
                birthPlace: item["Tempat Lahir"] || item.tempat_lahir || item.birthPlace,
                status: item.Status || item.status || "PNS",
                keaktifan: item.Keaktifan || item.keaktifan || "Aktif",
                golongan: item.Golongan || item.golongan || "-",
                namaJabatan: item.Jabatan || item.jabatan || ""
            })).filter(item => item.name && item.nip);

            if (formattedData.length === 0) {
                toast.error("Tidak ada data valid untuk diimpor");
                return;
            }

            toast.info(`Sedang mengimpor ${formattedData.length} data pegawai...`);

            const result = await importEmployeesAction(formattedData);

            if ("error" in result) {
                toast.error(result.error as string);
            } else {
                router.refresh();
                toast.success("Data berhasil diimpor");
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const toggleSort = (field: "name" | "nip") => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    // 3. Pagination logic

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-2xl">
                        <Users className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Daftar Pegawai</h1>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Sistem Informasi Kepegawaian DKPP</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button
                        onClick={handleAdd}
                        className="h-12 px-6 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 shadow-xl shadow-green-100 transition-all active:scale-95 group"
                    >
                        <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                        Tambah Pegawai
                    </Button>
                </div>
            </div>

            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                <CardHeader className="pb-4 pt-6 px-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-green-600 transition-colors" />
                            <Input
                                placeholder="Cari nama atau NIP..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-12 h-11 bg-slate-50 border-slate-200 rounded-xl focus:ring-green-500/20 font-semibold"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={handleDownloadTemplate}
                                className="h-11 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Template
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-2 pr-4 border-r border-slate-100 mr-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter</span>
                        </div>

                        <Select value={filterGender || "all"} onValueChange={(val) => { setFilterGender(val === "all" ? "" : (val ?? "")); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[160px] h-10 rounded-lg border-slate-200 bg-slate-50 font-bold text-xs">
                                <SelectValue placeholder="Jenis Kelamin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kelamin</SelectItem>
                                <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                <SelectItem value="Perempuan">Perempuan</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filterStatus || "all"} onValueChange={(val) => { setFilterStatus(val === "all" ? "" : (val ?? "")); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[140px] h-10 rounded-lg border-slate-200 bg-slate-50 font-bold text-xs">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="PNS">PNS</SelectItem>
                                <SelectItem value="CPNS">CPNS</SelectItem>
                                <SelectItem value="PPPK">PPPK</SelectItem>
                                <SelectItem value="PPPK Paruh Waktu">PPPK Paruh Waktu</SelectItem>
                                <SelectItem value="Outsourcing">Outsourcing</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filterKeaktifan || "all"} onValueChange={(val) => { setFilterKeaktifan(val === "all" ? "" : (val ?? "")); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[140px] h-10 rounded-lg border-slate-200 bg-slate-50 font-bold text-xs">
                                <SelectValue placeholder="Keaktifan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Keaktifan</SelectItem>
                                <SelectItem value="Aktif">Aktif</SelectItem>
                                <SelectItem value="Pensiun">Pensiun</SelectItem>
                                <SelectItem value="Mutasi">Mutasi</SelectItem>
                            </SelectContent>
                        </Select>

                        {(filterGender || filterStatus || filterKeaktifan || searchTerm) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearchTerm("");
                                    setFilterGender("");
                                    setFilterStatus("");
                                    setFilterKeaktifan("");
                                    setCurrentPage(1);
                                }}
                                className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-black text-[10px] uppercase tracking-widest px-3 ml-auto"
                            >
                                Reset Filter
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-slate-100">
                                <TableHead className="w-12 pl-6">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-green-600 focus:ring-green-500 w-4 h-4 cursor-pointer"
                                        checked={currentItems.length > 0 && selectedIds.length === currentItems.length}
                                        onChange={toggleSelectAll}
                                    />
                                </TableHead>
                                <TableHead
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer hover:text-slate-900 transition-colors"
                                    onClick={() => toggleSort("name")}
                                >
                                    <div className="flex items-center gap-2">
                                        Pegawai
                                        {sortField === "name" && (
                                            <span className="text-green-600">{sortOrder === "asc" ? "↑" : "↓"}</span>
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Detail Lahir</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status / Gol</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Jenis Kelamin</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Keaktifan</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Jabatan</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-right pr-6">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentItems.length > 0 ? (
                                currentItems.map((emp) => (
                                    <TableRow
                                        key={emp.id}
                                        className={cn(
                                            "border-slate-50 transition-colors group",
                                            selectedIds.includes(emp.id) ? 'bg-green-50/30' : 'hover:bg-slate-50/50'
                                        )}
                                    >
                                        <TableCell className="pl-6">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 text-green-600 focus:ring-green-500 w-4 h-4 cursor-pointer"
                                                checked={selectedIds.includes(emp.id)}
                                                onChange={() => toggleSelect(emp.id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="font-bold text-slate-900 leading-tight group-hover:text-green-600 transition-colors">
                                                        {emp.name}
                                                    </div>
                                                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                                                        {emp.nip}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                                                    <MapPin className="w-3 h-3 text-slate-400" />
                                                    {emp.birthPlace}
                                                </div>
                                                <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 pl-4">
                                                    <Calendar className="w-3 h-3" />
                                                    {emp.birthDate}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <div className="text-xs font-bold text-slate-700">{emp.status}</div>
                                                {emp.status !== "Outsourcing" && (
                                                    <Badge variant="outline" className="w-fit h-5 px-1.5 text-[9px] font-black bg-slate-50 border-slate-200 text-slate-500 rounded uppercase tracking-tighter">
                                                        {emp.golongan}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {isGenderSaving === emp.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-blue-600 mx-auto" />
                                            ) : editingGenderId === emp.id ? (
                                                <Select value={emp.gender || ""} onValueChange={(val) => handleGenderChange(emp.id, val ?? "")}>
                                                    <SelectTrigger className="h-8 w-[110px] text-[10px] font-bold mx-auto">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                                        <SelectItem value="Perempuan">Perempuan</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Badge
                                                    onClick={() => setEditingGenderId(emp.id)}
                                                    variant={emp.gender === "Laki-laki" ? "default" : "secondary"}
                                                    className={cn(
                                                        "h-6 px-3 text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95",
                                                        emp.gender === "Laki-laki" ? "bg-blue-500 hover:bg-blue-600" : "bg-rose-500 hover:bg-rose-600 text-white"
                                                    )}
                                                >
                                                    {emp.gender}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {isKeaktifanSaving === emp.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-green-600 mx-auto" />
                                            ) : editingKeaktifanId === emp.id ? (
                                                <Select value={emp.keaktifan || ""} onValueChange={(val) => handleKeaktifanChange(emp.id, val ?? "")}>
                                                    <SelectTrigger className="h-8 w-[100px] text-[10px] font-bold mx-auto">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Aktif">Aktif</SelectItem>
                                                        <SelectItem value="Pensiun">Pensiun</SelectItem>
                                                        <SelectItem value="Mutasi">Mutasi</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Badge
                                                    onClick={() => setEditingKeaktifanId(emp.id)}
                                                    variant={emp.keaktifan === "Aktif" ? "success" : emp.keaktifan === "Pensiun" ? "secondary" : "warning"}
                                                    className="h-6 px-3 text-[10px] font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
                                                >
                                                    {emp.keaktifan}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-[200px]">
                                                {isPositionSaving === emp.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Menyimpan...</span>
                                                    </div>
                                                ) : editingPositionId === emp.id ? (
                                                    <Select
                                                        value={emp.positionId || "none"}
                                                        onValueChange={(val) => handlePositionChange(emp.id, val === "none" ? "" : (val ?? ""))}
                                                    >
                                                        <SelectTrigger className="h-9 w-full text-xs font-bold">
                                                            <SelectValue placeholder="Pilih Jabatan" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none">- Pilih Jabatan -</SelectItem>
                                                            {positions.map(p => (
                                                                <SelectItem key={p.id} value={p.id}>{p.namaJabatan}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <div
                                                        onClick={() => setEditingPositionId(emp.id)}
                                                        className="cursor-pointer group/pos"
                                                    >
                                                        <div className="text-sm font-bold text-slate-900 line-clamp-1 group-hover/pos:text-blue-600 transition-colors">
                                                            {emp.position?.namaJabatan || '-'}
                                                        </div>
                                                        {emp.position && (
                                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                                {emp.position.jenisJabatan}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(emp)}
                                                    className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setHistoryEmployee(emp)}
                                                    className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                                >
                                                    <FileText className="w-5 h-5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(emp.id, emp.name)}
                                                    className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="w-10 h-10 text-slate-200" />
                                            <p className="text-sm font-bold text-slate-400 italic">Tidak ada data pegawai ditemukan.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="bg-white border-t border-slate-100 px-6 py-4 rounded-b-2xl shadow-sm -mt-8 mx-auto w-[98%] max-w-full">
                <StandardPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    totalItems={filteredEmployees.length}
                    itemsPerPage={itemsPerPage}
                    onLimitChange={handleLimitChange}
                    color="green"
                />
            </div>

            <EmployeeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                employee={editingEmployee}
                positions={positions}
            />

            <AnimatePresence>
                {historyEmployee && (
                    <EmployeeHistoryOverlay
                        employee={historyEmployee}
                        documents={initialDocuments.filter(d => d.employeeId === historyEmployee.id)}
                        positions={positions}
                        onClose={() => setHistoryEmployee(null)}
                    />
                )}
            </AnimatePresence>

            {/* Bulk Action Bar */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white px-2 py-2 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-1 min-w-[500px]"
                    >
                        <div className="flex items-center gap-3 bg-green-600 px-4 py-3 rounded-[14px]">
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-xs">
                                {selectedIds.length}
                            </div>
                            <span className="text-sm font-black uppercase tracking-widest whitespace-nowrap">Terpilih</span>
                        </div>

                        <div className="flex-1 px-4 flex items-center gap-3">
                            <Select value={activeBulkField} onValueChange={(val) => setActiveBulkField(val ?? "")}>
                                <SelectTrigger className="h-10 bg-slate-800 border-slate-700 text-white font-bold text-xs ring-0 focus:ring-0">
                                    <SelectValue placeholder="Pilih Aksi Massal" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                    <SelectItem value="positionId">Ubah Jabatan</SelectItem>
                                    <SelectItem value="status">Ubah Status</SelectItem>
                                    <SelectItem value="keaktifan">Ubah Keaktifan</SelectItem>
                                    <SelectItem value="gender">Ubah Jenis Kelamin</SelectItem>
                                    <SelectItem value="golongan">Ubah Golongan</SelectItem>
                                </SelectContent>
                            </Select>

                            {activeBulkField === "positionId" && (
                                <Select onValueChange={(val: any) => handleBulkUpdate({ positionId: (val as string) || "" }, "Jabatan")}>
                                    <SelectTrigger className="h-10 w-[200px] bg-indigo-600 border-indigo-500 text-white font-bold text-xs ring-0 focus:ring-0">
                                        <SelectValue placeholder="Pilih Jabatan" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                        {positions.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.namaJabatan}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {activeBulkField === "status" && (
                                <Select onValueChange={(val: any) => handleBulkUpdate({ status: (val as string) || "" }, "Status")}>
                                    <SelectTrigger className="h-10 w-[150px] bg-indigo-600 border-indigo-500 text-white font-bold text-xs ring-0 focus:ring-0">
                                        <SelectValue placeholder="Pilih Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                        <SelectItem value="PNS">PNS</SelectItem>
                                        <SelectItem value="CPNS">CPNS</SelectItem>
                                        <SelectItem value="PPPK">PPPK</SelectItem>
                                        <SelectItem value="PPPK Paruh Waktu">PPPK Paruh Waktu</SelectItem>
                                        <SelectItem value="Outsourcing">Outsourcing</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <Button
                            variant="ghost"
                            onClick={() => {
                                setSelectedIds([]);
                                setActiveBulkField("");
                            }}
                            className="text-slate-400 hover:text-white hover:bg-slate-800 px-6 font-black uppercase tracking-widest text-[10px]"
                        >
                            Batal
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="rounded-2xl border-slate-200">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black text-slate-900 tracking-tight">Hapus Pegawai?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-bold text-slate-500">
                            Anda akan menghapus data <span className="text-slate-900 font-black">{employeeToDelete?.name}</span>. Tindakan ini tidak dapat dibatalkan dan semua data terkait akan hilang.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 mt-4">
                        <AlertDialogCancel className="rounded-xl font-bold border-slate-200 text-slate-600">Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white border-0"
                        >
                            Ya, Hapus Permanen
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
