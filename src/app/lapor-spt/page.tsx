"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FileText, Send, CheckCircle2, AlertCircle, UploadCloud, Search, User } from "lucide-react";
import { submitSpt } from "@/actions/spt";
import { getEmployeesForSelect } from "@/actions/employees";

export default function LaporSptPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [fileName, setFileName] = useState("");

    const [employees, setEmployees] = useState<{ id: string, name: string, nip: string }[]>([]);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState<{ name: string, nip: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

    useEffect(() => {
        const fetchEmployees = async () => {
            const result = await getEmployeesForSelect();
            if (result.success && result.data) {
                setEmployees(result.data);
            }
            setIsLoadingEmployees(false);
        };
        fetchEmployees();
    }, []);

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.nip.includes(searchTerm)
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (!selectedEmployee) {
            setSubmitStatus("error");
            setErrorMessage("Silakan pilih pegawai terlebih dahulu");
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus("idle");
        setErrorMessage("");

        const formData = new FormData(form);
        // Ensure name and nip from selected employee are in formData
        formData.set("name", selectedEmployee.name);
        formData.set("nip", selectedEmployee.nip);

        try {
            const result = await submitSpt(formData);

            if (result.success) {
                setSubmitStatus("success");
                form.reset();
                setFileName("");
                setSelectedEmployee(null);
                setSearchTerm("");
            } else {
                setSubmitStatus("error");
                setErrorMessage(result.error || "Terjadi kesalahan saat mengirim SPT");
            }
        } catch (error: any) {
            setSubmitStatus("error");
            setErrorMessage(error.message || "Terjadi kesalahan sistem, silakan coba lagi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            {/* Hero Section */}
            <section className="relative py-20 bg-gradient-to-br from-green-900 via-green-800 to-blue-900 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
                        <FileText className="w-4 h-4 text-green-400" />
                        <span className="text-xs font-black uppercase tracking-widest">LAPOR SPT TAHUNAN</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                        Pelaporan SPT <span className="text-green-400">Pegawai</span>
                    </h1>
                    <p className="text-lg text-green-100/80 max-w-2xl mx-auto">
                        Fasilitas pelaporan Surat Pemberitahuan Tahunan (SPT) bagi Aparatur Sipil Negara di lingkungan Dinas Ketahanan Pangan dan Pertanian Kabupaten Indramayu.
                    </p>
                </div>
            </section>

            {/* Form Section */}
            <section className="py-12 -mt-10 relative z-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-6 md:p-10 border border-slate-100">
                        {submitStatus === "success" ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Laporan SPT Berhasil Dikirim</h3>
                                <p className="text-gray-500 mb-8">
                                    Terima kasih, dokumen bukti pelaporan SPT Tahunan Anda telah kami terima dan akan segera diproses.
                                </p>
                                <button
                                    onClick={() => setSubmitStatus("idle")}
                                    className="px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
                                >
                                    Kirim Laporan Lain
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {submitStatus === "error" && (
                                    <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <p className="font-medium text-sm">{errorMessage}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Pilih Pegawai</label>
                                    <div className="relative">
                                        <div
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-green-500 bg-slate-50/50 cursor-pointer flex items-center justify-between"
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        >
                                            {selectedEmployee ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-900">{selectedEmployee.name}</div>
                                                        <div className="text-[10px] font-medium text-slate-500">NIP: {selectedEmployee.nip}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-sm">Cari nama atau NIP...</span>
                                            )}
                                            <Search className="w-5 h-5 text-slate-400" />
                                        </div>

                                        {isDropdownOpen && (
                                            <div className="absolute z-30 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="p-3 border-b border-slate-50">
                                                    <input
                                                        type="text"
                                                        placeholder="Ketik nama atau NIP..."
                                                        className="w-full px-3 py-2 text-sm border-none focus:ring-0 outline-none font-medium"
                                                        autoFocus
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                                <div className="max-h-60 overflow-y-auto">
                                                    {isLoadingEmployees ? (
                                                        <div className="p-8 text-center">
                                                            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Memuat data...</p>
                                                        </div>
                                                    ) : filteredEmployees.length > 0 ? (
                                                        filteredEmployees.map((emp) => (
                                                            <div
                                                                key={emp.id}
                                                                className="px-4 py-3 hover:bg-green-50 cursor-pointer transition-colors border-b border-slate-50 last:border-none"
                                                                onClick={() => {
                                                                    setSelectedEmployee({ name: emp.name, nip: emp.nip });
                                                                    setIsDropdownOpen(false);
                                                                    setSearchTerm("");
                                                                }}
                                                            >
                                                                <div className="text-sm font-bold text-slate-900">{emp.name}</div>
                                                                <div className="text-xs text-slate-500">NIP: {emp.nip}</div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-8 text-center text-slate-400">
                                                            <p className="text-sm font-bold">Pegawai tidak ditemukan</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {isDropdownOpen && <div className="fixed inset-0 z-20" onClick={() => setIsDropdownOpen(false)} />}
                                </div>

                                <div>
                                    <label htmlFor="year" className="block text-sm font-semibold text-slate-700 mb-2">Tahun Pajak</label>
                                    <select
                                        id="year"
                                        name="year"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-slate-900 bg-slate-50/50"
                                        defaultValue={years[1]}
                                    >
                                        <option value="" disabled>Pilih Tahun Pajak</option>
                                        {years.map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Bukti Lapor SPT (Gambar/Foto)</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="file"
                                            name="file"
                                            accept="image/*"
                                            required
                                            className="hidden"
                                            onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                                        />
                                        <label
                                            htmlFor="file"
                                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${fileName ? 'border-green-400 bg-green-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
                                                }`}
                                        >
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <UploadCloud className={`w-8 h-8 mb-3 ${fileName ? 'text-green-500' : 'text-slate-400'}`} />
                                                <p className="mb-2 text-sm text-slate-500">
                                                    <span className="font-semibold text-slate-700">Klik untuk mengunggah</span> atau seret foto ke sini
                                                </p>
                                                <p className="text-xs text-slate-500 font-medium">JPG, PNG, atau WebP (Maks. 5MB)</p>
                                            </div>
                                        </label>
                                        {fileName && (
                                            <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                                                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-md border border-green-200 inline-block truncate max-w-[250px]">
                                                    {fileName}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-2 text-xs text-slate-500 bg-blue-50 text-blue-700 p-2 rounded-lg border border-blue-100">
                                        <AlertCircle className="inline w-3 h-3 mr-1" />
                                        File Anda akan otomatis diubah namanya menjadi format: <strong>Nama_NIP_Tahun.ekstensi</strong>
                                    </p>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Memproses...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Kirim Dokumen SPT
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
