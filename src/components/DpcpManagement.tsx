"use client";

import { useState, useEffect } from "react";
import { EmployeeDisplay } from "@/lib/employees";
import { FileType, Download, Loader2, User, Briefcase, AlertCircle } from "lucide-react";
import { generateDpcpWordAction } from "@/actions/dpcp";
import Swal from "sweetalert2";

interface DpcpManagementProps {
    employees: EmployeeDisplay[];
}

export function DpcpManagement({ employees }: DpcpManagementProps) {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [isGeneratingWord, setIsGeneratingWord] = useState(false);

    const [formData, setFormData] = useState({
        batasUsiaPensiun: "",
        ttl: "",
        pangkatGolongan: "",
        gajiPokok: "",
        masaKerja: "",
        masaKerjaGolongan: "",
        masaKerjaTambahan: "",
        tmtCpns: "",
        namaPejabat: ""
    });

    const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

    const getPangkatFromGolongan = (gol: string) => {
        const mapping: { [key: string]: string } = {
            "IV/e": "Pembina Utama",
            "IV/d": "Pembina Utama Madya",
            "IV/c": "Pembina Utama Muda",
            "IV/b": "Pembina Tingkat I",
            "IV/a": "Pembina",
            "III/d": "Penata Tingkat I",
            "III/c": "Penata",
            "III/b": "Penata Muda Tingkat I",
            "III/a": "Penata Muda",
            "II/d": "Pengatur Tingkat I",
            "II/c": "Pengatur",
            "II/b": "Pengatur Muda Tingkat I",
            "II/a": "Pengatur Muda",
            "I/d": "Juru Tingkat I",
            "I/c": "Juru",
            "I/b": "Juru Muda Tingkat I",
            "I/a": "Juru Muda",
        };
        return mapping[gol] || "";
    };

    const formatDateIndo = (dateStr: string) => {
        if (!dateStr || dateStr === "-") return "";
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            const months = [
                "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
                "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
            ];
            return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
        } catch {
            return dateStr;
        }
    };

    useEffect(() => {
        if (selectedEmployee) {
            const pangkatStr = getPangkatFromGolongan(selectedEmployee.golongan);
            const pangkatDanGolongan = `${pangkatStr.toUpperCase()} / ${selectedEmployee.golongan.toUpperCase()}`;
            
            let ttlStr = selectedEmployee.birthPlace.toUpperCase();
            if (selectedEmployee.birthDate && selectedEmployee.birthDate !== '-') {
                // Parse birthDate (it usually comes as "DD Month YYYY" from parseNip)
                ttlStr += ", " + selectedEmployee.birthDate.toUpperCase();
            }

            setFormData({
                batasUsiaPensiun: selectedEmployee.retirementAge ? `${selectedEmployee.retirementAge} TAHUN` : "58 TAHUN",
                ttl: ttlStr,
                pangkatGolongan: pangkatDanGolongan,
                gajiPokok: "", 
                masaKerja: "", 
                masaKerjaGolongan: "",
                masaKerjaTambahan: "",
                tmtCpns: "",
                namaPejabat: "Drs. H. SUGENG HERYANTO, M.Si" 
            });
        } else {
            // Kosongkan form jika tidak ada pegawai yang dipilih (sesuai instruksi)
            setFormData({
                batasUsiaPensiun: "",
                ttl: "",
                pangkatGolongan: "",
                gajiPokok: "",
                masaKerja: "",
                masaKerjaGolongan: "",
                masaKerjaTambahan: "",
                tmtCpns: "",
                namaPejabat: ""
            });
        }
    }, [selectedEmployee]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerateWord = async () => {
        if (!selectedEmployeeId) {
            Swal.fire("Peringatan", "Pilih pegawai terlebih dahulu", "warning");
            return;
        }

        setIsGeneratingWord(true);
        try {
            const result = await generateDpcpWordAction(selectedEmployeeId, formData);

            if ('error' in result && result.error) {
                throw new Error(result.error);
            }

            if ('content' in result && 'fileName' in result) {
                // Download file
                const blob = b64toBlob(result.content as string, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = result.fileName as string;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                Swal.fire({
                    icon: "success",
                    title: "Berhasil",
                    text: "Dokumen Word DPCP berhasil dibuat",
                    timer: 2000
                });
            }
        } catch (error: any) {
            Swal.fire("Error", error.message, "error");
        } finally {
            setIsGeneratingWord(false);
        }
    };

    // Helper b64 to blob
    const b64toBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        return new Blob(byteArrays, { type: contentType });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar: Search and Select */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 leading-none">Pilih Pegawai</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Cari Nama / NIP</label>
                            <select
                                value={selectedEmployeeId}
                                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900"
                            >
                                <option value="">-- Pilih Pegawai --</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name} ({emp.nip})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedEmployee && (
                            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black">
                                        {selectedEmployee.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-extrabold text-gray-900 leading-none">{selectedEmployee.name}</div>
                                        <div className="text-[10px] font-bold text-blue-600 uppercase mt-1">Jabatan Aktif</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                    <div className="p-2 bg-white rounded-xl border border-blue-100">
                                        <div className="text-gray-400 font-bold uppercase tracking-tighter">NIP</div>
                                        <div className="font-black text-gray-700">{selectedEmployee.nip}</div>
                                    </div>
                                    <div className="p-2 bg-white rounded-xl border border-blue-100">
                                        <div className="text-gray-400 font-bold uppercase tracking-tighter">GOL</div>
                                        <div className="font-black text-gray-700">{selectedEmployee.golongan}</div>
                                    </div>
                                </div>
                                <div className="p-2 bg-white rounded-xl border border-blue-100">
                                    <div className="text-gray-400 font-bold uppercase tracking-tighter">JABATAN</div>
                                    <div className="font-black text-xs text-gray-700">{selectedEmployee.position?.namaJabatan || "-"}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-xl">
                                <FileType className="w-6 h-6 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900">Formulir DPCP</h2>
                        </div>
                        <AlertCircle className="w-5 h-5 text-gray-300" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Pangkat / Golongan</label>
                                <input
                                    type="text"
                                    name="pangkatGolongan"
                                    value={formData.pangkatGolongan}
                                    onChange={handleInputChange}
                                    placeholder="PEMBINA / IV/A"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900 text-sm"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Tempat, Tanggal Lahir</label>
                                <input
                                    type="text"
                                    name="ttl"
                                    value={formData.ttl}
                                    onChange={handleInputChange}
                                    placeholder="YOGYAKARTA, 26 MARET 1968"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">TMT CPNS</label>
                                <input
                                    type="text"
                                    name="tmtCpns"
                                    value={formData.tmtCpns}
                                    onChange={handleInputChange}
                                    placeholder="11 APRIL 1994"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Batas Usia Pensiun</label>
                                <input
                                    type="text"
                                    name="batasUsiaPensiun"
                                    value={formData.batasUsiaPensiun}
                                    onChange={handleInputChange}
                                    placeholder="58 TAHUN"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900 text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-sky-50 rounded-3xl border border-sky-100 space-y-4">
                                <h3 className="font-black text-sky-800 text-sm uppercase tracking-wider">Gaji & Masa Kerja</h3>
                                
                                <div>
                                    <label className="block text-[10px] font-black text-sky-400 uppercase tracking-widest mb-1">Gaji Pokok</label>
                                    <input
                                        type="text"
                                        name="gajiPokok"
                                        value={formData.gajiPokok}
                                        onChange={handleInputChange}
                                        placeholder="5.235.000"
                                        className="w-full px-3 py-2 bg-white border border-sky-100 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-bold text-sm text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-sky-400 uppercase tracking-widest mb-1">Masa Kerja Sbg CPNS / PNS</label>
                                    <input
                                        type="text"
                                        name="masaKerja"
                                        value={formData.masaKerja}
                                        onChange={handleInputChange}
                                        placeholder="29 TAHUN, 1 BULAN – 01 MARET 2023"
                                        className="w-full px-3 py-2 bg-white border border-sky-100 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-bold text-sm text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-sky-400 uppercase tracking-widest mb-1">Masa Kerja Golongan</label>
                                    <input
                                        type="text"
                                        name="masaKerjaGolongan"
                                        value={formData.masaKerjaGolongan}
                                        onChange={handleInputChange}
                                        placeholder="32 TAHUN 00 BULAN"
                                        className="w-full px-3 py-2 bg-white border border-sky-100 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-bold text-sm text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-sky-400 uppercase tracking-widest mb-1">Masa Kerja Tambahan</label>
                                    <input
                                        type="text"
                                        name="masaKerjaTambahan"
                                        value={formData.masaKerjaTambahan}
                                        onChange={handleInputChange}
                                        placeholder="00 TAHUN 00 BULAN"
                                        className="w-full px-3 py-2 bg-white border border-sky-100 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-bold text-sm text-gray-900"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                                <h3 className="font-black text-gray-800 text-sm uppercase tracking-wider">Penandatangan</h3>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nama Pejabat</label>
                                    <input
                                        type="text"
                                        name="namaPejabat"
                                        value={formData.namaPejabat}
                                        onChange={handleInputChange}
                                        placeholder="Drs. H. SUGENG HERYANTO, M.Si"
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 outline-none transition-all font-bold text-sm text-gray-900"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-50">
                        <button
                            onClick={handleGenerateWord}
                            disabled={isGeneratingWord || !selectedEmployeeId}
                            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-100 transition-all active:scale-95"
                        >
                            {isGeneratingWord ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Sedang Membuat Word...
                                </>
                            ) : (
                                <>
                                    <Download className="w-5 h-5" />
                                    Unduh Format Word
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-3xl text-white shadow-lg overflow-hidden relative">
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="font-extrabold text-lg">Panduan Singkat</div>
                            <div className="text-white/80 text-sm font-medium">Pilih pegawai untuk auto-fill data, lalu lengkapi isian lainnya. Unduh untuk mendapatkan file Word DPCP.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
