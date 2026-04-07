"use client";

import { useState } from "react";
import { 
    Wand2, 
    Loader2, 
    Copy, 
    Check, 
    FileText, 
    Sparkles, 
    RefreshCcw,
    ChevronLeft
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    CardDescription,
    CardFooter 
} from "./ui/card";
import { generatePrdAction } from "@/actions/gemini-prd";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function PrdGeneratorClient() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const [formData, setFormData] = useState({
        projectName: "",
        description: "",
        targetAudience: "",
        features: ""
    });

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.projectName || !formData.description) {
            toast.error("Nama Proyek dan Deskripsi wajib diisi!");
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const data = await generatePrdAction(formData);
            if (data.success && data.content) {
                setResult(data.content);
                toast.success("PRD Berhasil di-generate!");
            } else {
                toast.error(data.error || "Gagal membuat PRD.");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem.");
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        setCopied(true);
        toast.success("Disalin ke clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const resetForm = () => {
        setFormData({
            projectName: "",
            description: "",
            targetAudience: "",
            features: ""
        });
        setResult(null);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
                            <Wand2 className="w-6 h-6" />
                        </div>
                        AI PRD Generator
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">
                        Buat draf Product Requirements Document profesional dalam hitungan detik menggunakan Gemini 1.5 Flash.
                    </p>
                </div>
                {result && (
                    <Button 
                        variant="outline" 
                        onClick={resetForm}
                        className="rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                    >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Buat Baru
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Section */}
                <div className={cn(
                    "transition-all duration-500",
                    result ? "lg:col-span-4" : "lg:col-span-12 max-w-3xl mx-auto w-full"
                )}>
                    <Card className="border-slate-200/60 shadow-xl overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-lg font-bold text-slate-800">Parameter Proyek</CardTitle>
                            <CardDescription>Masukkan detail proyek untuk memberikan konteks pada AI.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleGenerate} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-wider text-slate-400">Nama Proyek</label>
                                    <Input 
                                        placeholder="Contoh: Sistem Informasi Ketahanan Pangan"
                                        value={formData.projectName}
                                        onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                                        className="h-11 rounded-xl border-slate-200 font-bold focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-wider text-slate-400">Deskripsi & Latar Belakang</label>
                                    <Textarea 
                                        placeholder="Apa masalah yang ingin diselesaikan? Apa tujuan sistem ini?"
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="min-h-[120px] rounded-xl border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-wider text-slate-400">Target Pengguna</label>
                                    <Input 
                                        placeholder="Contoh: Petani, Admin Dinas, Masyarakat Umum"
                                        value={formData.targetAudience}
                                        onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                                        className="h-11 rounded-xl border-slate-200 font-bold focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-wider text-slate-400">Fitur Utama (Opsional)</label>
                                    <Textarea 
                                        placeholder="Sebutkan fitur-fitur wajib jika ada..."
                                        value={formData.features}
                                        onChange={(e) => setFormData({...formData, features: e.target.value})}
                                        className="min-h-[100px] rounded-xl border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>

                                <Button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            MENYUSUN PRD...
                                        </<>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-5 w-5" />
                                            GENERATE DENGAN AI
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Result Section */}
                <AnimatePresence>
                    {result && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="lg:col-span-8"
                        >
                            <Card className="border-slate-200/60 shadow-2xl overflow-hidden bg-white h-full flex flex-col">
                                <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between sticky top-0 z-10 backdrop-blur-sm bg-white/90">
                                    <div>
                                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-indigo-600" />
                                            Hasil Draft PRD
                                        </CardTitle>
                                        <CardDescription>Dokumen ini dihasilkan secara otomatis oleh AI.</CardDescription>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={copyToClipboard}
                                        className="rounded-lg font-bold border-slate-200"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
                                        {copied ? "Tersalin" : "Salin Teks"}
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-0 flex-1 overflow-y-auto">
                                    <div className="p-8 prose prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-600 prose-strong:text-slate-900">
                                        <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                                            {result}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-slate-50 border-t border-slate-100 p-4">
                                    <p className="text-[10px] text-slate-400 font-medium">
                                        * Hasil AI mungkin memerlukan penyesuaian manual sesuai kebijakan teknis dinas.
                                    </p>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
