"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { Save, Briefcase } from "lucide-react";
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

interface PositionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Position>) => Promise<void>;
    position?: Position | null;
}

export function PositionModal({ isOpen, onClose, onSave, position }: PositionModalProps) {
    const [formData, setFormData] = useState<Partial<Position>>({
        namaJabatan: "",
        jenisJabatan: "Struktural",
        batasUsiaPensiun: 58,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (position) {
            setFormData({
                id: position.id,
                namaJabatan: position.namaJabatan,
                jenisJabatan: position.jenisJabatan,
                eselon: position.eselon || undefined,
                jenjangFungsional: position.jenjangFungsional || undefined,
                jenisPelaksana: position.jenisPelaksana || undefined,
                batasUsiaPensiun: position.batasUsiaPensiun,
            });
        } else {
            setFormData({
                namaJabatan: "",
                jenisJabatan: "Struktural",
                batasUsiaPensiun: 58,
            });
        }
    }, [position, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.namaJabatan) {
            toast.error("Nama Jabatan harus diisi");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            toast.error("Gagal menyimpan jabatan");
        } finally {
            setIsSubmitting(false);
        }
    };

    const eselonOptions = ["I.a", "I.b", "II.a", "II.b", "III.a", "III.b", "IV.a", "IV.b"];
    const jenjangFungsionalOptions = ["Ahli Pertama", "Ahli Muda", "Ahli Madya", "Ahli Utama", "Pemula", "Terampil", "Mahir", "Penyelia"];
    const jenisPelaksanaOptions = ["Kelerek", "Operator", "Teknisi"];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] rounded-3xl border-slate-200 shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="bg-slate-50/50 p-6 border-b border-slate-100 sticky top-0 z-10">
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                        {position ? "Edit" : "Tambah"} <span className="text-blue-600">Jabatan</span>
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                            Nama Jabatan
                        </Label>
                        <Input
                            required
                            value={formData.namaJabatan}
                            onChange={(e) => setFormData({ ...formData, namaJabatan: e.target.value })}
                            className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-blue-500/20"
                            placeholder="Contoh: Kepala Biro..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                            Jenis Jabatan
                        </Label>
                        <Select
                            value={String(formData.jenisJabatan ?? "Struktural")}
                            onValueChange={(val: string | null) => setFormData({
                                ...formData,
                                jenisJabatan: val as any,
                                eselon: undefined,
                                jenjangFungsional: undefined,
                                jenisPelaksana: undefined
                            })}
                        >
                            <SelectTrigger className="h-11 w-full bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-blue-500/20">
                                <SelectValue placeholder="Pilih Jenis" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Struktural">Struktural</SelectItem>
                                <SelectItem value="Fungsional">Fungsional</SelectItem>
                                <SelectItem value="Pelaksana">Pelaksana</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.jenisJabatan === 'Struktural' && (
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                Eselon
                            </Label>
                            <Select
                                value={String(formData.eselon ?? "")}
                                onValueChange={(val: string | null) => setFormData({ ...formData, eselon: val || undefined })}
                            >
                                <SelectTrigger className="h-11 w-full bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-blue-500/20">
                                    <SelectValue placeholder="-- Pilih Eselon --" />
                                </SelectTrigger>
                                <SelectContent>
                                    {eselonOptions.map(opt => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {formData.jenisJabatan === 'Fungsional' && (
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                Jenjang Fungsional
                            </Label>
                            <Select
                                value={String(formData.jenjangFungsional ?? "")}
                                onValueChange={(val: string | null) => setFormData({ ...formData, jenjangFungsional: val || undefined })}
                            >
                                <SelectTrigger className="h-11 w-full bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-blue-500/20">
                                    <SelectValue placeholder="-- Pilih Jenjang --" />
                                </SelectTrigger>
                                <SelectContent>
                                    {jenjangFungsionalOptions.map(opt => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {formData.jenisJabatan === 'Pelaksana' && (
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                Jenis Pelaksana
                            </Label>
                            <Select
                                value={String(formData.jenisPelaksana ?? "")}
                                onValueChange={(val: string | null) => setFormData({ ...formData, jenisPelaksana: val || undefined })}
                            >
                                <SelectTrigger className="h-11 w-full bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-blue-500/20">
                                    <SelectValue placeholder="-- Pilih Jenis --" />
                                </SelectTrigger>
                                <SelectContent>
                                    {jenisPelaksanaOptions.map(opt => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                            Batas Usia Pensiun
                        </Label>
                        <Select
                            value={String(formData.batasUsiaPensiun ?? 58)}
                            onValueChange={(val: string | null) => setFormData({ ...formData, batasUsiaPensiun: val ? parseInt(val) : 58 })}
                        >
                            <SelectTrigger className="h-11 w-full bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-blue-500/20">
                                <SelectValue placeholder="Pilih Usia" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="58">58 Tahun</SelectItem>
                                <SelectItem value="60">60 Tahun</SelectItem>
                                <SelectItem value="65">65 Tahun</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

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
