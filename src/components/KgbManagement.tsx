"use client";

import { useState, useEffect } from "react";
import { EmployeeDisplay } from "@/lib/employees";
import {
    FileText,
    Download,
    Loader2,
    User,
    Calendar,
    FileType,
    Briefcase,
    AlertCircle,
    Printer
} from "lucide-react";
import { generateKgbWordAction } from "@/actions/kgb";
import Swal from "sweetalert2";

interface KgbManagementProps {
    employees: EmployeeDisplay[];
}

export function KgbManagement({ employees }: KgbManagementProps) {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [isGeneratingWord, setIsGeneratingWord] = useState(false);

    const [formData, setFormData] = useState({
        nomorSk: "",
        tanggalSk: new Date().toISOString().split('T')[0],
        pangkat: "",
        gajiPokokLama: "",
        pejabatSkLama: "",
        tanggalSkLama: "",
        nomorSkLama: "",
        tglBerlakuSkLama: "",
        mkLamaTahun: "",
        mkLamaBulan: "",
        gajiPokokBaru: "",
        mkBaruTahun: "",
        mkBaruBulan: "",
        tmtKgb: "",
        kenaikanGajiAkanDatang: "",
        pejabatPenandatangan: "KEPALA DINAS KETAHANAN PANGAN DAN PERTANIAN",
        namaPejabat: "Drs. H. SUGENG HERYANTO, M.Si",
        nipPejabat: "196609231987091001"
    });

    const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

    const terbilang = (nominal: number): string => {
        const helper = (n: number): string => {
            const numbers = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
            if (n < 12) return numbers[n];
            if (n < 20) return helper(n - 10) + " belas";
            if (n < 100) return helper(Math.floor(n / 10)) + " puluh " + helper(n % 10);
            if (n < 200) return "seratus " + helper(n - 100);
            if (n < 1000) return helper(Math.floor(n / 100)) + " ratus " + helper(n % 100);
            if (n < 2000) return "seribu " + helper(n - 1000);
            if (n < 1000000) return helper(Math.floor(n / 1000)) + " ribu " + helper(n % 1000);
            if (n < 1000000000) return helper(Math.floor(n / 1000000)) + " juta " + helper(n % 1000000);
            if (n < 1000000000000) return helper(Math.floor(n / 1000000000)) + " milyar " + helper(n % 1000000000);
            return "";
        };

        const result = helper(nominal).replace(/\s+/g, " ").trim();
        return (result || "nol") + " rupiah";
    };

    const formatDateIndo = (dateStr: string) => {
        if (!dateStr) return "-";
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    const formatCurrency = (val: string) => {
        const num = parseInt(val.replace(/\D/g, ""));
        if (isNaN(num)) return "-";
        return "Rp. " + new Intl.NumberFormat("id-ID").format(num);
    };

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

    const salaryScale: { [key: string]: { [key: number]: number } } = {
        "III/a": { 0: 2785700, 2: 2873500, 4: 2964000, 6: 3057300, 8: 3153600, 10: 3252900, 12: 3355400, 14: 3461100, 16: 3570100, 18: 3682500, 20: 3798500, 22: 3918100, 24: 4041500, 26: 4168800, 28: 4300100, 30: 4435500, 32: 4575200 },
        "III/b": { 0: 2903600, 2: 2995000, 4: 3089300, 6: 3186600, 8: 3287000, 10: 3390500, 12: 3497300, 14: 3607500, 16: 3721100, 18: 3838300, 20: 3959200, 22: 4083900, 24: 4212500, 26: 4345100, 28: 4482000, 30: 4623200, 32: 4768800 },
        "III/c": { 0: 3026400, 2: 3121700, 4: 3220000, 6: 3321400, 8: 3426000, 10: 3533900, 12: 3645200, 14: 3760100, 16: 3878500, 18: 4000600, 20: 4126600, 22: 4256600, 24: 4390700, 26: 4528900, 28: 4671600, 30: 4818700, 32: 4970500 },
        "III/d": { 0: 3154400, 2: 3253700, 4: 3356200, 6: 3461900, 8: 3571000, 10: 3683400, 12: 3799400, 14: 3919100, 16: 4042500, 18: 4169900, 20: 4301200, 22: 4436700, 24: 4576400, 26: 4720500, 28: 4869200, 30: 5022500, 32: 5180700 },
        "IV/a": { 0: 3287800, 2: 3391400, 4: 3498200, 6: 3608400, 8: 3722000, 10: 3839200, 12: 3960200, 14: 4084900, 16: 4213500, 18: 4346200, 20: 4483100, 22: 4624300, 24: 4770000, 26: 4920200, 28: 5075200, 30: 5235000, 32: 5399900 },
        "IV/b": { 0: 3426900, 2: 3534800, 4: 3646200, 6: 3761000, 8: 3879500, 10: 4001600, 12: 4127700, 14: 4257700, 16: 4391800, 18: 4530100, 20: 4672800, 22: 4819900, 24: 4971700, 26: 5128300, 28: 5289800, 30: 5456400, 32: 5628300 },
        "IV/c": { 0: 3571900, 2: 3684400, 4: 3800400, 6: 3920100, 8: 4043800, 10: 4170900, 12: 4302300, 14: 4437800, 16: 4577500, 18: 4721700, 20: 4870400, 22: 5023800, 24: 5182000, 26: 5345200, 28: 5513600, 30: 5687200, 32: 5866400 },
        "IV/d": { 0: 3723000, 2: 3840200, 4: 3961200, 6: 4085900, 8: 4214600, 10: 4347300, 12: 4484300, 14: 4625500, 16: 4771200, 18: 4921400, 20: 5075400, 22: 5236300, 24: 5401200, 26: 5571400, 28: 5746800, 30: 5927900, 32: 6114500 },
        "IV/e": { 0: 3880400, 2: 4002700, 4: 4128700, 6: 4258700, 8: 4392900, 10: 4531200, 12: 4673900, 14: 4821100, 16: 4973000, 18: 5129600, 20: 5291200, 22: 5457800, 24: 5629700, 26: 5807000, 28: 5989900, 30: 6178600, 32: 6373200 },
        "II/a": { 0: 2184000, 1: 2218400, 3: 2288200, 5: 2360300, 7: 2434600, 9: 2511300, 11: 2590400, 13: 2672000, 15: 2756200, 17: 2843000, 19: 2932500, 21: 3024900, 23: 3120100, 25: 3218400, 27: 3319800, 29: 3424300, 31: 3532200, 33: 3643400 },
        "II/b": { 3: 2385000, 5: 2460100, 7: 2537600, 9: 2617500, 11: 2700000, 13: 2785000, 15: 2872700, 17: 2963200, 19: 3056500, 21: 3152800, 23: 3252100, 25: 3354500, 27: 3460200, 29: 3569200, 31: 3681600, 33: 3797500 },
        "II/c": { 3: 2485900, 5: 2564200, 7: 2645000, 9: 2728300, 11: 2814200, 13: 2902800, 15: 2994300, 17: 3088600, 19: 3185800, 21: 3286200, 23: 3389700, 25: 3496400, 27: 3606500, 29: 3720100, 31: 3837300, 33: 3958200 },
        "II/d": { 3: 2591100, 5: 2672700, 7: 2756800, 9: 2843700, 11: 2933200, 13: 3025600, 15: 3120900, 17: 3219200, 19: 3320600, 21: 3425200, 23: 3533100, 25: 3644300, 27: 3759100, 29: 3877500, 31: 3999600, 33: 4125600 },
        "I/a": { 0: 1685700, 2: 1738800, 4: 1793500, 6: 1850000, 8: 1908300, 10: 1968400, 12: 2030400, 14: 2094300, 16: 2160300, 18: 2228300, 20: 2298500, 22: 2370900, 24: 2445500, 26: 2522600 },
        "I/b": { 3: 1840800, 5: 1898800, 7: 1958600, 9: 2020300, 11: 2083900, 13: 2149600, 15: 2217300, 17: 2287100, 19: 2359100, 21: 2433400, 23: 2510100, 25: 2589100, 27: 2670700 },
        "I/c": { 3: 1918700, 5: 1979100, 7: 2041500, 9: 2105800, 11: 2172100, 13: 2240500, 15: 2311100, 17: 2383900, 19: 2458900, 21: 2536400, 23: 2616300, 25: 2698700, 27: 2783700 },
        "I/d": { 3: 1999900, 5: 2062900, 7: 2127800, 9: 2194800, 11: 2264000, 13: 2335300, 15: 2408800, 17: 2484700, 19: 2562900, 21: 2643700, 23: 2726900, 25: 2812800, 27: 2901400 },
    };

    useEffect(() => {
        if (selectedEmployee) {
            setFormData(prev => ({
                ...prev,
                pangkat: getPangkatFromGolongan(selectedEmployee.golongan)
            }));
        }
    }, [selectedEmployee]);

    useEffect(() => {
        if (selectedEmployee && formData.mkBaruTahun !== "") {
            const year = parseInt(formData.mkBaruTahun);
            const gol = selectedEmployee.golongan;
            if (salaryScale[gol] && salaryScale[gol][year] !== undefined) {
                setFormData(prev => ({
                    ...prev,
                    gajiPokokBaru: salaryScale[gol][year].toString()
                }));
            }
        }
    }, [selectedEmployee, formData.mkBaruTahun]);

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
            const dataToPass = {
                ...formData,
                tanggalSkFormatted: formatDateIndo(formData.tanggalSk),
                tanggalSkLamaFormatted: formatDateIndo(formData.tanggalSkLama),
                tglBerlakuSkLamaFormatted: formatDateIndo(formData.tglBerlakuSkLama),
                tmtKgbFormatted: formatDateIndo(formData.tmtKgb),
                kenaikanGajiAkanDatangFormatted: formatDateIndo(formData.kenaikanGajiAkanDatang),
                gajiPokokLamaFormatted: formatCurrency(formData.gajiPokokLama),
                gajiPokokBaruFormatted: formatCurrency(formData.gajiPokokBaru),
                terbilangLama: terbilang(parseInt(formData.gajiPokokLama.replace(/\D/g, "") || "0")),
                terbilangBaru: terbilang(parseInt(formData.gajiPokokBaru.replace(/\D/g, "") || "0")),
                masaKerjaSkLama: `${formData.mkLamaTahun} Tahun ${formData.mkLamaBulan} Bulan`,
                masaKerjaSkBaru: `${formData.mkBaruTahun} Tahun ${formData.mkBaruBulan} Bulan`,
            };

            const result = await generateKgbWordAction(selectedEmployeeId, dataToPass);

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
                    text: "Dokumen Word berhasil dibuat",
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
                        <div className="p-2 bg-green-100 rounded-xl">
                            <User className="w-5 h-5 text-green-600" />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 leading-none">Pilih Pegawai</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Cari Nama / NIP</label>
                            <select
                                value={selectedEmployeeId}
                                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-gray-900"
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
                            <div className="p-4 bg-green-50 rounded-2xl border border-green-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-black">
                                        {selectedEmployee.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-extrabold text-gray-900 leading-none">{selectedEmployee.name}</div>
                                        <div className="text-[10px] font-bold text-green-600 uppercase mt-1">Jabatan Aktif</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                    <div className="p-2 bg-white rounded-xl border border-green-100">
                                        <div className="text-gray-400 font-bold uppercase tracking-tighter">NIP</div>
                                        <div className="font-black text-gray-700">{selectedEmployee.nip}</div>
                                    </div>
                                    <div className="p-2 bg-white rounded-xl border border-green-100">
                                        <div className="text-gray-400 font-bold uppercase tracking-tighter">GOL</div>
                                        <div className="font-black text-gray-700">{selectedEmployee.golongan}</div>
                                    </div>
                                </div>
                                <div className="p-2 bg-white rounded-xl border border-green-100">
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
                            <div className="p-2 bg-green-100 rounded-xl">
                                <FileType className="w-6 h-6 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900">Formulir SK KGB</h2>
                        </div>
                        <AlertCircle className="w-5 h-5 text-gray-300" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nomor SK</label>
                                <input
                                    type="text"
                                    name="nomorSk"
                                    value={formData.nomorSk}
                                    onChange={handleInputChange}
                                    placeholder="800/..../DKPP-Set/2026"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Tanggal SK (Indramayu, ...)</label>
                                <input
                                    type="date"
                                    name="tanggalSk"
                                    value={formData.tanggalSk}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Pangkat / Golongan</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        name="pangkat"
                                        placeholder="Pangkat"
                                        value={formData.pangkat}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-gray-900"
                                    />
                                    <div className="w-full px-4 py-3 bg-gray-100 border border-gray-100 rounded-2xl font-black text-gray-900 flex items-center">
                                        {selectedEmployee?.golongan || "-"}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 rounded-3xl border border-blue-100 space-y-4">
                                <h3 className="font-black text-blue-800 text-sm uppercase tracking-wider">Data SK Lama</h3>
                                <div>
                                    <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Pejabat SK Lama</label>
                                    <input
                                        type="text"
                                        name="pejabatSkLama"
                                        value={formData.pejabatSkLama}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: Bupati Indramayu"
                                        className="w-full px-3 py-2 bg-white border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm text-gray-900"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Tanggal SK Lama</label>
                                        <input
                                            type="date"
                                            name="tanggalSkLama"
                                            value={formData.tanggalSkLama}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-white border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Nomor SK Lama</label>
                                        <input
                                            type="text"
                                            name="nomorSkLama"
                                            value={formData.nomorSkLama}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-white border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm text-gray-900"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Tgl Berlaku</label>
                                        <input
                                            type="date"
                                            name="tglBerlakuSkLama"
                                            value={formData.tglBerlakuSkLama}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-white border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm text-gray-900"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className="block text-[8px] font-black text-blue-300 uppercase mb-0.5">Tahun</label>
                                            <input
                                                type="number"
                                                name="mkLamaTahun"
                                                placeholder="Tahun"
                                                value={formData.mkLamaTahun}
                                                onChange={handleInputChange}
                                                className="w-full px-2 py-1.5 bg-white border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-xs text-gray-900"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-[8px] font-black text-blue-300 uppercase mb-0.5">Bulan</label>
                                            <input
                                                type="number"
                                                name="mkLamaBulan"
                                                placeholder="Bulan"
                                                value={formData.mkLamaBulan}
                                                onChange={handleInputChange}
                                                className="w-full px-2 py-1.5 bg-white border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-xs text-gray-900"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Gaji Pokok Lama</label>
                                    <input
                                        type="text"
                                        name="gajiPokokLama"
                                        value={formData.gajiPokokLama}
                                        onChange={handleInputChange}
                                        placeholder="Angka saja, misal: 3500000"
                                        className="w-full px-3 py-2 bg-white border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm text-gray-900"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-green-50 rounded-3xl border border-green-100 space-y-4">
                                <h3 className="font-black text-green-800 text-sm uppercase tracking-wider">Data SK Baru</h3>
                                <div>
                                    <label className="block text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Gaji Pokok Baru</label>
                                    <input
                                        type="text"
                                        name="gajiPokokBaru"
                                        value={formData.gajiPokokBaru}
                                        onChange={handleInputChange}
                                        placeholder="Angka saja, misal: 3700000"
                                        className="w-full px-3 py-2 bg-white border border-green-100 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-sm text-gray-900"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className="block text-[8px] font-black text-green-300 uppercase mb-0.5">Tahun</label>
                                            <input
                                                type="number"
                                                name="mkBaruTahun"
                                                placeholder="Tahun"
                                                value={formData.mkBaruTahun}
                                                onChange={handleInputChange}
                                                className="w-full px-2 py-1.5 bg-white border border-green-100 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-xs text-gray-900"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-[8px] font-black text-green-300 uppercase mb-0.5">Bulan</label>
                                            <input
                                                type="number"
                                                name="mkBaruBulan"
                                                placeholder="Bulan"
                                                value={formData.mkBaruBulan}
                                                onChange={handleInputChange}
                                                className="w-full px-2 py-1.5 bg-white border border-green-100 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-xs text-gray-900"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">TMT KGB</label>
                                        <input
                                            type="date"
                                            name="tmtKgb"
                                            value={formData.tmtKgb}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-white border border-green-100 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-sm text-gray-900"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Kenaikan Gaji Y.A.D</label>
                                    <input
                                        type="date"
                                        name="kenaikanGajiAkanDatang"
                                        value={formData.kenaikanGajiAkanDatang}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-white border border-green-100 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-sm text-gray-900"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                                <h3 className="font-black text-gray-800 text-sm uppercase tracking-wider">Penandatangan</h3>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Jabatan Pejabat</label>
                                    <input
                                        type="text"
                                        name="pejabatPenandatangan"
                                        value={formData.pejabatPenandatangan}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 outline-none transition-all font-bold text-sm text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nama Pejabat</label>
                                    <input
                                        type="text"
                                        name="namaPejabat"
                                        value={formData.namaPejabat}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 outline-none transition-all font-bold text-sm text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">NIP Pejabat</label>
                                    <input
                                        type="text"
                                        name="nipPejabat"
                                        value={formData.nipPejabat}
                                        onChange={handleInputChange}
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
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-3xl text-white shadow-lg overflow-hidden relative">
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="font-extrabold text-lg">Panduan Singkat</div>
                            <div className="text-white/80 text-sm font-medium">Pilih pegawai, lengkapi data KGB, dan klik tombol untuk mengunduh format Word.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
