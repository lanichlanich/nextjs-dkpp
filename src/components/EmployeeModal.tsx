"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { Save, User, CreditCard, MapPin, Briefcase, Hash } from "lucide-react";
import { Employee } from "@/lib/employees";
import { Position } from "@/lib/positions";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
            toast.error("Semua field harus diisi");
            return;
        }

        if (formData.nip.length < 18) {
            toast.error("NIP harus berjumlah 18 digit");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            toast.error("Gagal menyimpan data pegawai");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] rounded-3xl border-slate-200 shadow-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
                <DialogHeader className="bg-slate-50/50 p-6 border-b border-slate-100 sticky top-0 z-10">
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                        {employee ? "Edit" : "Tambah"} <span className="text-green-600">Pegawai</span>
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-green-600" />
                            Nama Lengkap
                        </Label>
                        <Input
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-green-500/20"
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <CreditCard className="w-3.5 h-3.5 text-green-600" />
                            NIP (18 Digit)
                        </Label>
                        <Input
                            maxLength={18}
                            value={formData.nip}
                            onChange={(e) => {
                                const newNip = e.target.value.replace(/[^0-9]/g, "");
                                let updates: Partial<Employee> = { nip: newNip };

                                if (newNip.length === 18) {
                                    const genderDigit = newNip.charAt(14);
                                    updates.gender = genderDigit === '1' ? 'Laki-laki' : 'Perempuan';
                                }
                                setFormData({ ...formData, ...updates });
                            }}
                            className="h-11 bg-slate-50 border-slate-200 rounded-xl font-mono tracking-wider focus-visible:ring-green-500/20"
                            placeholder="199001152015011002"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-green-600" />
                                Tempat Lahir
                            </Label>
                            <Input
                                value={formData.birthPlace}
                                onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                                className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-green-500/20"
                                placeholder="Indramayu"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-green-600" />
                                Jenis Kelamin
                            </Label>
                            <Select
                                value={String(formData.gender ?? "")}
                                onValueChange={(val: string | null) => setFormData({ ...formData, gender: val as any })}
                            >
                                <SelectTrigger className="h-11 w-full bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-green-500/20">
                                    <SelectValue placeholder="Pilih Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Briefcase className="w-3.5 h-3.5 text-green-600" />
                                Status
                            </Label>
                            <Select
                                value={String(formData.status ?? "")}
                                onValueChange={(val: string | null) => {
                                    if (!val) return;
                                    setFormData({
                                        ...formData,
                                        status: val as any,
                                        golongan: (val === "PNS" || val === "CPNS") ? "III/a" : (val.startsWith("PPPK") ? "IX" : "-")
                                    });
                                }}
                            >
                                <SelectTrigger className="h-11 w-full bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-green-500/20">
                                    <SelectValue placeholder="Pilih Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PNS">PNS</SelectItem>
                                    <SelectItem value="CPNS">CPNS</SelectItem>
                                    <SelectItem value="PPPK">PPPK</SelectItem>
                                    <SelectItem value="PPPK Paruh Waktu">PPPK Paruh Waktu</SelectItem>
                                    <SelectItem value="Outsourcing">Outsourcing</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Hash className="w-3.5 h-3.5 text-green-600" />
                                Keaktifan
                            </Label>
                            <Select
                                value={String(formData.keaktifan ?? "")}
                                onValueChange={(val: string | null) => setFormData({ ...formData, keaktifan: val as any })}
                            >
                                <SelectTrigger className="h-11 w-full bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-green-500/20">
                                    <SelectValue placeholder="Pilih Keaktifan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Aktif">Aktif</SelectItem>
                                    <SelectItem value="Pensiun">Pensiun</SelectItem>
                                    <SelectItem value="Mutasi">Mutasi</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5 text-green-600" />
                            Jabatan
                        </Label>
                        <Select
                            value={String(formData.positionId ?? "NULL")}
                            onValueChange={(val: string | null) => setFormData({ ...formData, positionId: val === "NULL" ? null : val })}
                        >
                            <SelectTrigger className="h-11 w-full bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-green-500/20">
                                <SelectValue placeholder="-- Pilih Jabatan --" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NULL">-- Tanpa Jabatan --</SelectItem>
                                {positions.map((pos) => (
                                    <SelectItem key={pos.id} value={pos.id}>
                                        {pos.namaJabatan} ({pos.jenisJabatan})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {(formData.status !== "Outsourcing") && (
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Hash className="w-3.5 h-3.5 text-green-600" />
                                Golongan
                            </Label>
                            <Select
                                value={String(formData.golongan ?? "")}
                                onValueChange={(val: string | null) => setFormData({ ...formData, golongan: val as any })}
                            >
                                <SelectTrigger className="h-11 w-full bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-green-500/20">
                                    <SelectValue placeholder="Pilih Golongan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(formData.status === "PNS" || formData.status === "CPNS") ? (
                                        ["I/a", "I/b", "I/c", "I/d", "II/a", "II/b", "II/c", "II/d", "III/a", "III/b", "III/c", "III/d", "IV/a", "IV/b", "IV/c", "IV/d", "IV/e"].map(g => (
                                            <SelectItem key={g} value={g}>{g}</SelectItem>
                                        ))
                                    ) : (
                                        ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"].map(g => (
                                            <SelectItem key={g} value={g}>{g}</SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <DialogFooter className="pt-6 border-t border-slate-50 gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="h-11 flex-1 rounded-xl font-black text-slate-500 hover:bg-slate-100"
                        >
                            BATAL
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-11 flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl shadow-2xl transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Save className="w-4 h-4" />
                                    SIMPAN
                                </span>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
