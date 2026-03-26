"use client";
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Save, FileText, Hash, Calendar, FileType, Info, Upload, FileUp } from "lucide-react";
import { JdihDocument } from "@/lib/jdih";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface JdihModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: FormData) => Promise<void>;
    document?: JdihDocument | null;
}

const DOCUMENT_TYPES = [
    "Peraturan Daerah",
    "Peraturan Bupati",
    "Keputusan Bupati",
    "Instruksi Bupati",
    "Surat Edaran Bupati",
    "Lainnya"
];

export function JdihModal({ isOpen, onClose, onSave, document }: JdihModalProps) {
    const [formData, setFormData] = useState<Partial<JdihDocument>>({
        title: "",
        type: "Peraturan Daerah",
        number: "",
        year: new Date().getFullYear().toString(),
        description: "",
        filePath: "",
    });
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (document) {
            setFormData({
                id: document.id,
                title: document.title,
                type: document.type,
                number: document.number,
                year: document.year,
                description: document.description || "",
                filePath: document.filePath || "",
                fileName: document.fileName || "",
            });
        } else {
            setFormData({
                title: "",
                type: "Peraturan Daerah",
                number: "",
                year: new Date().getFullYear().toString(),
                description: "",
                filePath: "",
            });
        }
        setPdfFile(null);
    }, [document, isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                toast.error("File harus berformat PDF");
                return;
            }
            setPdfFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.number || !formData.year) {
            toast.error("Field Judul, Nomor, dan Tahun harus diisi");
            return;
        }

        const data = new FormData();
        if (formData.id) data.append('id', formData.id);
        data.append('title', formData.title || '');
        data.append('type', formData.type || '');
        data.append('number', formData.number || '');
        data.append('year', formData.year || '');
        data.append('description', formData.description || '');

        if (pdfFile) {
            data.append('file', pdfFile);
        } else if (formData.filePath) {
            data.append('filePath', formData.filePath);
        }

        setIsSubmitting(true);
        try {
            await onSave(data);
            onClose();
        } catch (error) {
            toast.error("Gagal menyimpan dokumen hukum");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] rounded-3xl border-slate-200 shadow-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
                <DialogHeader className="bg-slate-50/50 p-6 border-b border-slate-100 sticky top-0 z-10">
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                        {document ? "Edit" : "Tambah"} <span className="text-blue-600">Dokumen Hukum</span>
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                            Judul Dokumen
                        </Label>
                        <Textarea
                            rows={3}
                            required
                            value={formData.title}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, title: e.target.value })}
                            className="bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-blue-500/20 resize-none"
                            placeholder="Contoh: Pembentukan Produk Hukum Daerah..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <FileType className="w-3.5 h-3.5 text-blue-600" />
                                Jenis Produk Hukum
                            </Label>
                            <Select
                                value={String(formData.type ?? "Peraturan Daerah")}
                                onValueChange={(val: string | null) => setFormData({ ...formData, type: val as any })}
                            >
                                <SelectTrigger className="h-11 w-full bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-blue-500/20">
                                    <SelectValue placeholder="Pilih Jenis" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DOCUMENT_TYPES.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Hash className="w-3.5 h-3.5 text-blue-600" />
                                Nomor
                            </Label>
                            <Input
                                required
                                value={formData.number}
                                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-blue-500/20"
                                placeholder="Contoh: 12"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                Tahun
                            </Label>
                            <Input
                                type="number"
                                required
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-blue-500/20"
                                placeholder="2024"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <FileUp className="w-3.5 h-3.5 text-blue-600" />
                                Upload PDF
                            </Label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="h-11 w-full px-4 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors group"
                            >
                                <Upload className={cn("w-4 h-4 transition-colors", pdfFile ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500")} />
                                <span className={cn("text-sm truncate flex-1 font-bold", pdfFile ? "text-blue-700" : (formData.filePath ? "text-green-600" : "text-slate-500"))}>
                                    {pdfFile ? pdfFile.name : (formData.filePath ? "✅ PDF Terupload" : "Pilih file PDF...")}
                                </span>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Info className="w-3.5 h-3.5 text-blue-600" />
                            Keterangan Ringkas
                        </Label>
                        <Input
                            value={formData.description || ""}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold focus-visible:ring-blue-500/20"
                            placeholder="Tentang regulasi ini..."
                        />
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
