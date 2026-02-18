"use client";

import { useState } from "react";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Briefcase,
    Calendar,
    Users,
    ChevronLeft,
    ChevronRight,
    FileDown,
    FileUp,
    FileText,
    Download,
    Cake,
    Clock,
    ShieldCheck,
    Hash,
    Loader2
} from "lucide-react";
import { Employee, EmployeeDisplay } from "@/lib/employees";
import { Position } from "@/lib/positions";
import { saveEmployeeAction, deleteEmployeeAction, importEmployeesAction, bulkUpdateEmployeesAction } from "@/actions/employees";
import { EmployeeModal } from "./EmployeeModal";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { StandardPagination } from "./ui/StandardPagination";

interface EmployeeManagementProps {
    initialEmployees: EmployeeDisplay[];
    positions: Position[];
}

export function EmployeeManagement({ initialEmployees, positions }: EmployeeManagementProps) {
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
    const [itemsPerPage] = useState(10);
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
            Swal.fire("Error", result.error, "error");
        } else {
            router.refresh();
            setEditingKeaktifanId(null);
            Swal.fire({
                icon: "success",
                title: "Updated",
                text: "Keaktifan berhasil diperbarui",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 2000
            });
        }
        setIsKeaktifanSaving(null);
    };

    const handleGenderChange = async (id: string, gender: string) => {
        setIsGenderSaving(id);
        const result = await saveEmployeeAction({ id, gender });

        if ("error" in result) {
            Swal.fire("Error", result.error, "error");
        } else {
            router.refresh();
            setEditingGenderId(null);
            Swal.fire({
                icon: "success",
                title: "Updated",
                text: "Jenis Kelamin berhasil diperbarui",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 2000
            });
        }
        setIsGenderSaving(null);
    };

    const handlePositionChange = async (id: string, positionId: string) => {
        setIsPositionSaving(id);
        const result = await saveEmployeeAction({ id, positionId });

        if ("error" in result) {
            Swal.fire("Error", result.error, "error");
        } else {
            router.refresh();
            setEditingPositionId(null);
            Swal.fire({
                icon: "success",
                title: "Updated",
                text: "Jabatan berhasil diperbarui",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 2000
            });
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

        const result = await Swal.fire({
            title: 'Konfirmasi Perubahan Massal',
            text: `Apakah Anda yakin ingin mengubah ${label} untuk ${selectedIds.length} pegawai yang dipilih?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#dc2626',
            confirmButtonText: 'Ya, Ubah Massal',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            setIsBulkUpdating(true);
            const updateResult = await bulkUpdateEmployeesAction(selectedIds, data);

            if ("error" in updateResult) {
                Swal.fire("Error", updateResult.error, "error");
            } else {
                router.refresh();
                setSelectedIds([]);
                setActiveBulkField("");
                Swal.fire({
                    icon: "success",
                    title: "Berhasil",
                    text: `${selectedIds.length} pegawai berhasil diperbarui ${label.toLowerCase()}nya`,
                    timer: 2000
                });
            }
            setIsBulkUpdating(false);
        }
    };

    const handleSave = async (data: Partial<Employee>) => {
        const result = await saveEmployeeAction(data);

        if ("error" in result) {
            Swal.fire("Error", result.error, "error");
        } else {
            router.refresh();
            setIsModalOpen(false);
            Swal.fire({
                icon: "success",
                title: "Berhasil",
                text: "Data pegawai berhasil disimpan",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000
            });
        }
    };

    const handleDelete = async (id: string, name: string) => {
        const result = await Swal.fire({
            title: "Hapus Pegawai?",
            text: `Anda akan menghapus data ${name}. Tindakan ini tidak dapat dibatalkan.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, Hapus!",
            cancelButtonText: "Batal"
        });

        if (result.isConfirmed) {
            const deleteResult = await deleteEmployeeAction(id);
            if (typeof deleteResult === "object" && "error" in deleteResult) {
                Swal.fire("Error", deleteResult.error, "error");
            } else {
                router.refresh();
            }
        }
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

        Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Data berhasil diekspor ke Excel",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000
        });
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

        Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Data berhasil diekspor ke PDF",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000
        });
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
                Swal.fire("Error", "File Excel kosong atau tidak valid", "error");
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
                Swal.fire("Error", "Tidak ada data valid untuk diimpor", "error");
                return;
            }

            Swal.fire({
                title: "Mengimpor Data...",
                html: `Sedang mengimpor <b>${formattedData.length}</b> data pegawai.`,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const result = await importEmployeesAction(formattedData);

            if ("error" in result) {
                Swal.fire("Error", result.error, "error");
            } else {
                router.refresh();
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

    // 4. Birthday Logic
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1; // 1-12

    const birthdaysToday = employees.filter(emp =>
        emp.birthDay === currentDay && emp.birthMonth === currentMonth
    );

    const upcomingBirthdays = employees.filter(emp => {
        // Check next 7 days
        for (let i = 1; i <= 7; i++) {
            const checkDate = new Date();
            checkDate.setDate(today.getDate() + i);
            if (emp.birthDay === checkDate.getDate() && emp.birthMonth === (checkDate.getMonth() + 1)) {
                (emp as any).daysUntil = i;
                return true;
            }
        }
        return false;
    }).sort((a, b) => (a as any).daysUntil - (b as any).daysUntil);

    // 5. Retirement Logic (1-2 Years)
    // We already have `retirementYear` in EmployeeDisplay calculated from `getEmployees`
    const currentYear = new Date().getFullYear();
    const retiringSoon = employees.filter(emp => {
        if (!emp.retirementYear) return false;
        const yearsLeft = emp.retirementYear - currentYear;
        // warn if retiring in 1 or 2 years (next year or the year after)
        // If yearsLeft <= 0, they are already retired or retiring this year (handled by existing isRetiringThisYear flag maybe? or just verify)
        // The requirement is "1 sd 2 tahun kedepan"
        return yearsLeft >= 1 && yearsLeft <= 2;
    }).map(emp => ({
        ...emp,
        yearsLeft: (emp.retirementYear || 0) - currentYear
    })).sort((a, b) => a.yearsLeft - b.yearsLeft);

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
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 shadow-xl shadow-green-100 transition-all active:scale-95 group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        Tambah Pegawai
                    </button>
                    <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
                        <button
                            onClick={handleExportExcel}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                            title="Export Excel"
                        >
                            <FileDown className="w-6 h-6" />
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Export PDF"
                        >
                            <FileText className="w-6 h-6" />
                        </button>
                        <div className="w-px h-6 bg-gray-100 my-auto mx-1" />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Import Excel"
                        >
                            <FileUp className="w-6 h-6" />
                        </button>
                    </div>
                    <button
                        onClick={handleDownloadTemplate}
                        className="flex items-center gap-2 px-4 py-3 bg-white text-gray-600 font-bold rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all"
                        title="Download Template Excel"
                    >
                        <Download className="w-5 h-5" />
                        Template
                    </button>
                </div>
            </div>

            {/* Hidden Input for Import */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportExcel}
                accept=".xlsx, .xls"
                className="hidden"
            />

            {/* Birthday Section */}
            {(birthdaysToday.length > 0 || upcomingBirthdays.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {birthdaysToday.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl p-6 shadow-xl shadow-rose-100 text-white relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <Cake className="w-32 h-32" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Cake className="w-6 h-6 text-white" />
                                    </div>
                                    <h2 className="text-xl font-black uppercase tracking-wider">Ulang Tahun Hari Ini!</h2>
                                </div>
                                <div className="space-y-3">
                                    {birthdaysToday.map(emp => (
                                        <div key={emp.id} className="flex items-center justify-between bg-white/10 hover:bg-white/20 p-3 rounded-2xl backdrop-blur-sm transition-colors cursor-default">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center font-black text-xs">
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <span className="font-bold">{emp.name}</span>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-tighter bg-white text-rose-600 px-2 py-1 rounded-lg shadow-sm">
                                                Barakallah!
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {upcomingBirthdays.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-gray-900 relative overflow-hidden group"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-50 rounded-xl">
                                    <Clock className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider">Akan Datang</h2>
                            </div>
                            <div className="space-y-3">
                                {upcomingBirthdays.map(emp => (
                                    <div key={emp.id} className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-3 rounded-2xl transition-colors cursor-default border border-gray-100/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xs">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-gray-800">{emp.name}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                                                {(emp as any).daysUntil === 1 ? 'Besok' : `${(emp as any).daysUntil} hari lagi`}
                                            </span>
                                            <span className="text-[9px] text-gray-400 font-bold">{emp.birthDate.split(' ').slice(0, 2).join(' ')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            )}
            {/* Retirement Sections */}
            <div className="space-y-6 mb-6">
                {/* 1. Retiring THIS YEAR (Red Alert) */}
                {employees.filter(e => e.isRetiringThisYear).length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-50 rounded-3xl p-6 shadow-sm border border-red-100 text-gray-900 relative overflow-hidden group"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-100 rounded-xl">
                                <Clock className="w-6 h-6 text-red-600" />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider">Pensiun Tahun Ini ({currentYear})</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {employees.filter(e => e.isRetiringThisYear).map(emp => (
                                <div key={emp.id} className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border-l-4 border-red-500">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-black text-lg">
                                            {emp.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 line-clamp-1">{emp.name}</div>
                                            <div className="text-xs text-gray-500 line-clamp-1">{emp.position?.namaJabatan || '-'}</div>
                                            <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wide">
                                                TMT: {emp.tmtPensiun}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* 2. Retiring Next 1-2 Years (Orange Warning) */}
                {retiringSoon.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-orange-50 rounded-3xl p-6 shadow-sm border border-orange-100 text-gray-900 relative overflow-hidden group"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-100 rounded-xl">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider">Persiapan Pensiun (1-2 Tahun)</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {retiringSoon.map(emp => (
                                <div key={emp.id} className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-orange-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black text-sm">
                                            {emp.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-gray-900">{emp.name}</div>
                                            <div className="text-xs text-gray-500">{emp.position?.namaJabatan || '-'}</div>
                                            <div className="text-[10px] text-orange-600 font-bold mt-0.5">TMT: {emp.tmtPensiun}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-xs font-black text-orange-600 uppercase tracking-wider">
                                            {emp.yearsLeft} Thn Lagi
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-bold">{emp.retirementYear}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau NIP..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900 font-bold"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        <button
                            onClick={handleDownloadTemplate}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-bold transition-all text-sm"
                            title="Download Template Excel"
                        >
                            <Download className="w-4 h-4" />
                            Template
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-xl font-bold transition-all text-sm"
                        >
                            <FileUp className="w-4 h-4" />
                            Import
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImportExcel}
                            accept=".xlsx, .xls"
                            className="hidden"
                        />
                        <div className="h-10 w-px bg-gray-100 hidden md:block mx-1" />
                        <button
                            onClick={handleExportExcel}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-3 rounded-xl font-bold transition-all text-sm"
                        >
                            <FileDown className="w-4 h-4" />
                            Excel
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-3 rounded-xl font-bold transition-all text-sm"
                        >
                            <FileText className="w-4 h-4" />
                            PDF
                        </button>
                        <button
                            onClick={handleAdd}
                            className="w-full md:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-100 active:scale-95 ml-0 md:ml-2"
                        >
                            <Plus className="w-5 h-5" />
                            Pegawai
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Filter:</span>
                        <select
                            value={filterGender}
                            onChange={(e) => {
                                setFilterGender(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="text-xs font-bold text-gray-900 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Semua Jenis Kelamin</option>
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>
                        <select
                            value={filterBirthPlace}
                            onChange={(e) => {
                                setFilterBirthPlace(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="text-xs font-bold text-gray-900 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Semua Tempat Lahir</option>
                            {uniqueBirthPlaces.map(place => (
                                <option key={place} value={place}>{place}</option>
                            ))}
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="text-xs font-bold text-gray-900 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Semua Status</option>
                            <option value="PNS">PNS</option>
                            <option value="CPNS">CPNS</option>
                            <option value="PPPK">PPPK</option>
                            <option value="PPPK Paruh Waktu">PPPK Paruh Waktu</option>
                            <option value="Outsourcing">Outsourcing</option>
                        </select>
                        <select
                            value={filterKeaktifan}
                            onChange={(e) => {
                                setFilterKeaktifan(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="text-xs font-bold text-gray-900 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Semua Keaktifan</option>
                            <option value="Aktif">Aktif</option>
                            <option value="Pensiun">Pensiun</option>
                            <option value="Mutasi">Mutasi</option>
                        </select>
                    </div>
                    {/* Active Filters Display */}
                    {(filterGender || filterBirthPlace || searchTerm || filterStatus || filterKeaktifan || filterGolongan) && (
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setFilterGender("");
                                setFilterBirthPlace("");
                                setFilterStatus("");
                                setFilterKeaktifan("");
                                setFilterGolongan("");
                                setCurrentPage(1);
                            }}
                            className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 underline"
                        >
                            Reset Filter
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 w-10">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-4 h-4 cursor-pointer"
                                        checked={currentItems.length > 0 && selectedIds.length === currentItems.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th
                                    className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100/50 transition-colors"
                                    onClick={() => toggleSort("name")}
                                >
                                    <div className="flex items-center gap-2">
                                        Pegawai
                                        {sortField === "name" && (
                                            <span className="text-green-600">{sortOrder === "asc" ? "↑" : "↓"}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Detail Lahir</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Status / Gol</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Jenis Kelamin</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Keaktifan</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-left">Jabatan</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {currentItems.length > 0 ? (
                                currentItems.map((emp, idx) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={emp.id}
                                        className={`transition-colors group ${selectedIds.includes(emp.id) ? 'bg-green-50/50' : 'hover:bg-gray-50/50'}`}
                                    >
                                        <td className="px-6 py-5">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-4 h-4 cursor-pointer"
                                                checked={selectedIds.includes(emp.id)}
                                                onChange={() => toggleSelect(emp.id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </td>
                                        <td className="px-6 py-5" onClick={() => toggleSelect(emp.id)}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold">
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <div
                                                    className="cursor-pointer group/name"
                                                    onClick={() => handleEdit(emp)}
                                                >
                                                    <div className="font-bold text-gray-900 group-hover:text-green-600 group-hover/name:underline transition-colors">{emp.name}</div>
                                                    <div
                                                        className="text-xs font-mono text-gray-400 mt-0.5 hover:text-green-500 flex items-center gap-1"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleSort("nip");
                                                        }}
                                                    >
                                                        {emp.nip}
                                                        {sortField === "nip" && (
                                                            <span className="text-green-600 text-[10px]">{sortOrder === "asc" ? "↑" : "↓"}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                    {emp.birthPlace}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {emp.birthDate}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5">
                                                    <Briefcase className="w-3 h-3 text-gray-400" />
                                                    <span className="text-xs font-bold text-gray-700">{emp.status}</span>
                                                </div>
                                                {emp.status !== "Outsourcing" && (
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <Hash className="w-3 h-3 text-gray-400" />
                                                        <span className="text-[10px] font-black bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded uppercase">{emp.golongan}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            {isGenderSaving === emp.id ? (
                                                <div className="flex justify-center">
                                                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                                </div>
                                            ) : editingGenderId === emp.id ? (
                                                <select
                                                    autoFocus
                                                    value={emp.gender}
                                                    onChange={(e) => handleGenderChange(emp.id, e.target.value)}
                                                    onBlur={() => setEditingGenderId(null)}
                                                    className="text-[10px] font-bold text-gray-900 bg-gray-50 border border-blue-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="Laki-laki">Laki-laki</option>
                                                    <option value="Perempuan">Perempuan</option>
                                                </select>
                                            ) : (
                                                <span
                                                    onClick={() => setEditingGenderId(emp.id)}
                                                    className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer hover:ring-2 hover:ring-offset-1 transition-all ${emp.gender === "Laki-laki"
                                                        ? "bg-blue-50 text-blue-600 hover:ring-blue-200"
                                                        : "bg-pink-50 text-pink-600 hover:ring-pink-200"
                                                        }`}>
                                                    {emp.gender}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            {isKeaktifanSaving === emp.id ? (
                                                <div className="flex justify-center">
                                                    <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                                                </div>
                                            ) : editingKeaktifanId === emp.id ? (
                                                <select
                                                    autoFocus
                                                    value={emp.keaktifan}
                                                    onChange={(e) => handleKeaktifanChange(emp.id, e.target.value)}
                                                    onBlur={() => setEditingKeaktifanId(null)}
                                                    className="text-[10px] font-bold text-gray-900 bg-gray-50 border border-green-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-green-500"
                                                >
                                                    <option value="Aktif">Aktif</option>
                                                    <option value="Pensiun">Pensiun</option>
                                                    <option value="Mutasi">Mutasi</option>
                                                </select>
                                            ) : (
                                                <span
                                                    onClick={() => setEditingKeaktifanId(emp.id)}
                                                    className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer hover:ring-2 hover:ring-offset-1 transition-all ${emp.keaktifan === "Aktif"
                                                        ? "bg-green-50 text-green-600 hover:ring-green-200"
                                                        : emp.keaktifan === "Pensiun"
                                                            ? "bg-gray-100 text-gray-600 hover:ring-gray-200"
                                                            : "bg-orange-50 text-orange-600 hover:ring-orange-200"
                                                        }`}>
                                                    {emp.keaktifan}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                {isPositionSaving === emp.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Menyimpan...</span>
                                                    </div>
                                                ) : editingPositionId === emp.id ? (
                                                    <select
                                                        autoFocus
                                                        value={emp.positionId || ""}
                                                        onChange={(e) => handlePositionChange(emp.id, e.target.value)}
                                                        onBlur={() => setEditingPositionId(null)}
                                                        className="w-full text-xs font-bold text-gray-900 bg-gray-50 border border-blue-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 max-w-[200px]"
                                                    >
                                                        <option value="">- Pilih Jabatan -</option>
                                                        {positions.map(p => (
                                                            <option key={p.id} value={p.id}>{p.namaJabatan}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span
                                                        onClick={() => setEditingPositionId(emp.id)}
                                                        className="text-sm font-bold text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                                                    >
                                                        {emp.position?.namaJabatan || '-'}
                                                    </span>
                                                )}
                                                {emp.position && !editingPositionId && (
                                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full w-fit mt-1">
                                                        {emp.position.jenisJabatan}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(emp)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(emp.id, emp.name)}
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
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400 italic">
                                        Tidak ada data pegawai ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <StandardPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    totalItems={filteredEmployees.length}
                    itemsPerPage={itemsPerPage}
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

            {/* Bulk Action Bar */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-gray-800 flex items-center gap-6 min-w-[600px]"
                    >
                        <div className="flex items-center gap-3 pr-6 border-r border-gray-700">
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
                                {selectedIds.length}
                            </div>
                            <span className="text-sm font-bold truncate max-w-[150px]">Pegawai</span>
                        </div>

                        <div className="flex-1 flex items-center gap-4">
                            <select
                                value={activeBulkField}
                                onChange={(e) => setActiveBulkField(e.target.value)}
                                className="bg-gray-800 border border-gray-700 text-white text-xs font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">- Pilih Aksi Massal -</option>
                                <option value="positionId">Ubah Jabatan</option>
                                <option value="status">Ubah Status</option>
                                <option value="keaktifan">Ubah Keaktifan</option>
                                <option value="gender">Ubah Jenis Kelamin</option>
                                <option value="golongan">Ubah Golongan</option>
                            </select>

                            {activeBulkField === "positionId" && (
                                <select
                                    className="bg-gray-800 border border-gray-700 text-white text-xs font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 min-w-[150px]"
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            handleBulkUpdate({ positionId: e.target.value }, "Jabatan");
                                            setActiveBulkField("");
                                        }
                                    }}
                                >
                                    <option value="">- Pilih Jabatan -</option>
                                    {positions.map(p => (
                                        <option key={p.id} value={p.id}>{p.namaJabatan}</option>
                                    ))}
                                </select>
                            )}

                            {activeBulkField === "status" && (
                                <select
                                    className="bg-gray-800 border border-gray-700 text-white text-xs font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            handleBulkUpdate({ status: e.target.value }, "Status");
                                            setActiveBulkField("");
                                        }
                                    }}
                                >
                                    <option value="">- Pilih Status -</option>
                                    <option value="PNS">PNS</option>
                                    <option value="CPNS">CPNS</option>
                                    <option value="PPPK">PPPK</option>
                                    <option value="PPPK Paruh Waktu">PPPK Paruh Waktu</option>
                                    <option value="Outsourcing">Outsourcing</option>
                                </select>
                            )}

                            {activeBulkField === "keaktifan" && (
                                <select
                                    className="bg-gray-800 border border-gray-700 text-white text-xs font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            handleBulkUpdate({ keaktifan: e.target.value }, "Keaktifan");
                                            setActiveBulkField("");
                                        }
                                    }}
                                >
                                    <option value="">- Pilih Keaktifan -</option>
                                    <option value="Aktif">Aktif</option>
                                    <option value="Pensiun">Pensiun</option>
                                    <option value="Mutasi">Mutasi</option>
                                </select>
                            )}

                            {activeBulkField === "gender" && (
                                <select
                                    className="bg-gray-800 border border-gray-700 text-white text-xs font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            handleBulkUpdate({ gender: e.target.value }, "Jenis Kelamin");
                                            setActiveBulkField("");
                                        }
                                    }}
                                >
                                    <option value="">- Pilih Jenis Kelamin -</option>
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                            )}

                            {activeBulkField === "golongan" && (
                                <select
                                    className="bg-gray-800 border border-gray-700 text-white text-xs font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            handleBulkUpdate({ golongan: e.target.value }, "Golongan");
                                            setActiveBulkField("");
                                        }
                                    }}
                                >
                                    <option value="">- Pilih Golongan -</option>
                                    <optgroup label="PNS / CPNS">
                                        {["I/a", "I/b", "I/c", "I/d", "II/a", "II/b", "II/c", "II/d", "III/a", "III/b", "III/c", "III/d", "IV/a", "IV/b", "IV/c", "IV/d", "IV/e"].map(g => (
                                            <option key={g} value={g}>{g}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="PPPK">
                                        {["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"].map(g => (
                                            <option key={g} value={g}>{g}</option>
                                        ))}
                                    </optgroup>
                                    <option value="-">-</option>
                                </select>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                setSelectedIds([]);
                                setActiveBulkField("");
                            }}
                            className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
                            disabled={isBulkUpdating}
                        >
                            Batal
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Re-using icon from lucide
function MapPin({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    )
}
