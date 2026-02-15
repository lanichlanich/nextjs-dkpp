import { useState, useEffect } from "react";
import { X, Save, User, CreditCard, MapPin, Briefcase, ShieldCheck, Hash } from "lucide-react";
import { Employee } from "@/lib/employees";
import { Position } from "@/lib/positions";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

interface EmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Employee>) => Promise<void>;
    employee?: Employee | null;
    positions: Position[];
}

export function EmployeeModal({ isOpen, onClose, onSave, employee, positions }: EmployeeModalProps) {
    const [formData, setFormData] = useState<Partial<Employee>>({
        birthPlace: "",
        gender: "Laki-laki",
        status: "PNS",
        keaktifan: "Aktif",
        golongan: "-",
        positionId: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (employee) {
            setFormData({
                id: employee.id,
                name: employee.name,
                nip: employee.nip,
                birthPlace: employee.birthPlace,
                gender: employee.gender || "Laki-laki",
                status: employee.status || "PNS",
                keaktifan: employee.keaktifan || "Aktif",
                golongan: employee.golongan || "-",
                positionId: employee.positionId || null,
            });
        } else {
            setFormData({
                name: "",
                nip: "",
                birthPlace: "",
                gender: "Laki-laki",
                status: "PNS",
                keaktifan: "Aktif",
                golongan: "-",
                positionId: null,
            });
        }
    }, [employee, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.nip || !formData.birthPlace) {
            Swal.fire("Peringatan", "Semua field harus diisi", "warning");
            return;
        }

        if (formData.nip.length < 18) {
            Swal.fire("Peringatan", "NIP harus berjumlah 18 digit", "warning");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            Swal.fire("Error", "Gagal menyimpan data pegawai", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-green-50/50">
                            <h3 className="text-xl font-extrabold text-gray-900">
                                {employee ? "Edit" : "Tambah"} <span className="text-green-600">Pegawai</span>
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 text-green-600" />
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900 font-medium"
                                    placeholder="Masukkan nama lengkap..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <CreditCard className="w-3.5 h-3.5 text-green-600" />
                                    NIP (18 Digit)
                                </label>
                                <input
                                    maxLength={18}
                                    value={formData.nip}
                                    onChange={(e) => {
                                        const newNip = e.target.value.replace(/[^0-9]/g, "");
                                        let updates: Partial<Employee> = { nip: newNip };

                                        // Smart Gender: Extract gender from NIP if it's 18 digits
                                        if (newNip.length === 18) {
                                            const genderDigit = newNip.charAt(14);
                                            updates.gender = genderDigit === '1' ? 'Laki-laki' : 'Perempuan';
                                        }

                                        setFormData({ ...formData, ...updates });
                                    }}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900 font-mono tracking-wider"
                                    placeholder="Contoh: 199001152015011002"
                                />
                                <p className="text-[10px] text-gray-400 mt-1 italic">
                                    Format: YYYYMMDD (Tgl Lahir) + ...
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-green-600" />
                                        Tempat Lahir
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.birthPlace}
                                        onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900 font-medium"
                                        placeholder="Contoh: Indramayu"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <User className="w-3.5 h-3.5 text-green-600" />
                                        Jenis Kelamin
                                    </label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900 font-bold appearance-none"
                                    >
                                        <option value="Laki-laki">Laki-laki</option>
                                        <option value="Perempuan">Perempuan</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Briefcase className="w-3.5 h-3.5 text-green-600" />
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => {
                                            const newStatus = e.target.value;
                                            setFormData({
                                                ...formData,
                                                status: newStatus,
                                                golongan: (newStatus === "PNS" || newStatus === "CPNS") ? "III/a" : (newStatus.startsWith("PPPK") ? "IX" : "-")
                                            });
                                        }}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900 font-bold appearance-none"
                                    >
                                        <option value="PNS">PNS</option>
                                        <option value="CPNS">CPNS</option>
                                        <option value="PPPK">PPPK</option>
                                        <option value="PPPK Paruh Waktu">PPPK Paruh Waktu</option>
                                        <option value="Outsourcing">Outsourcing</option>
                                    </select>
                                </div>

                                <select
                                    value={formData.keaktifan}
                                    onChange={(e) => setFormData({ ...formData, keaktifan: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900 font-bold appearance-none"
                                >
                                    <option value="Aktif">Aktif</option>
                                    <option value="Pensiun">Pensiun</option>
                                    <option value="Mutasi">Mutasi</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Briefcase className="w-3.5 h-3.5 text-green-600" />
                                    Jabatan
                                </label>
                                <select
                                    value={formData.positionId || ""}
                                    onChange={(e) => setFormData({ ...formData, positionId: e.target.value || null })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900 font-bold appearance-none"
                                >
                                    <option value="">-- Pilih Jabatan --</option>
                                    {positions.map((pos) => (
                                        <option key={pos.id} value={pos.id}>
                                            {pos.namaJabatan} ({pos.jenisJabatan})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {(formData.status !== "Outsourcing") && (
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Hash className="w-3.5 h-3.5 text-green-600" />
                                        Golongan
                                    </label>
                                    <select
                                        value={formData.golongan}
                                        onChange={(e) => setFormData({ ...formData, golongan: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900 font-bold appearance-none"
                                    >
                                        {(formData.status === "PNS" || formData.status === "CPNS") ? (
                                            <>
                                                {["I/a", "I/b", "I/c", "I/d", "II/a", "II/b", "II/c", "II/d", "III/a", "III/b", "III/c", "III/d", "IV/a", "IV/b", "IV/c", "IV/d", "IV/e"].map(g => (
                                                    <option key={g} value={g}>{g}</option>
                                                ))}
                                            </>
                                        ) : (
                                            <>
                                                {["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"].map(g => (
                                                    <option key={g} value={g}>{g}</option>
                                                ))}
                                            </>
                                        )}
                                    </select>
                                </div>
                            )}

                            <div className="pt-4 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-xl font-black text-sm uppercase tracking-wide transition-all shadow-lg shadow-green-200 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Simpan
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )
            }
        </AnimatePresence >
    );
}
