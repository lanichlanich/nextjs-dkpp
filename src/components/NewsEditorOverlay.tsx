"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { X, Save, Loader2, Upload, ImageIcon, Eye, Layout, Type, AlignLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { createNewsAction, updateNewsAction } from "@/actions/news";
import { NewsItem } from "@/lib/news";
import { RichTextEditor } from "./RichTextEditor";
import { compressImage } from "@/lib/imageUtils";
import { useRouter } from "next/navigation";

interface NewsEditorOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    newsItem?: NewsItem | null;
}

export function NewsEditorOverlay({ isOpen, onClose, newsItem }: NewsEditorOverlayProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [content, setContent] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isEdit = !!newsItem;

    const [title, setTitle] = useState("");
    const [status, setStatus] = useState("Draft");
    const [excerpt, setExcerpt] = useState("");

    // Sync state with newsItem
    useEffect(() => {
        if (isOpen) {
            setTitle(newsItem?.title || "");
            setStatus(newsItem?.status || "Draft");
            setExcerpt(newsItem?.excerpt || "");
            setContent(newsItem?.content || "");
            setImagePreview(newsItem?.image || null);
            setImageFile(null);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, newsItem]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            Swal.fire("Error", "Judul berita tidak boleh kosong", "error");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("status", status);
        formData.append("excerpt", excerpt);
        formData.append("content", content);

        startTransition(async () => {
            try {
                if (imageFile) {
                    const compressedBlob = await compressImage(imageFile, 1280, 720, 0.8);
                    const fileToUpload = new File([compressedBlob], imageFile.name, { type: 'image/jpeg' });
                    formData.set("image", fileToUpload);
                } else if (isEdit && newsItem?.image) {
                    formData.set("image", newsItem.image);
                }

                const action = isEdit ? updateNewsAction.bind(null, newsItem.id) : createNewsAction;
                const result = await action(formData);

                if (result && 'error' in result) {
                    Swal.fire({ title: "Gagal", text: result.error, icon: "error" });
                    return;
                }

                if (result && result.success) {
                    Swal.fire({
                        title: "Berhasil!",
                        text: result.message,
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false,
                        toast: true,
                        position: "top-end"
                    });
                    router.refresh();
                    onClose();
                }
            } catch (err: any) {
                Swal.fire({ title: "Gagal", text: `Kesalahan: ${err.message}`, icon: "error" });
            }
        });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-gray-50 flex flex-col h-screen overflow-hidden"
            >
                {/* Header Section */}
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <div className="h-8 w-[1px] bg-gray-200 mx-2" />
                        <div>
                            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">
                                {isEdit ? "Edit Publikasi" : "Publikasi Baru"}
                            </h2>
                            <p className="text-xs font-bold text-green-600">DKPP Indramayu News Editor</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider ${status === 'Published' ? 'bg-green-100 text-green-700' :
                                status === 'Draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {status}
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={isPending}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-green-100 disabled:opacity-50 active:scale-95"
                        >
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isEdit ? "Update Berita" : "Terbitkan"}
                        </button>
                    </div>
                </header>

                {/* Editor Body */}
                <main className="flex-1 flex overflow-hidden">
                    {/* Writing Area */}
                    <div className="flex-1 overflow-y-auto bg-white custom-scrollbar flex justify-center">
                        <div className="w-full max-w-4xl p-8 md:p-12 space-y-8">
                            {/* Title Input */}
                            <div className="space-y-4">
                                <textarea
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Masukkan Judul Berita yang Menarik..."
                                    className="w-full text-4xl md:text-5xl font-black text-gray-900 border-none outline-none resize-none placeholder:text-gray-200 leading-tight"
                                    rows={2}
                                />
                                <div className="flex items-center gap-4 text-gray-400">
                                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                                        <Type className="w-4 h-4" />
                                        {title.length} Karakter
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-gray-200" />
                                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                                        <AlignLeft className="w-4 h-4" />
                                        {content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length} Kata
                                    </div>
                                </div>
                            </div>

                            {/* Content Editor */}
                            <div className="min-h-[500px] prose prose-green prose-lg max-w-none pb-20">
                                <RichTextEditor
                                    value={content}
                                    onChange={setContent}
                                    placeholder="Mulai menulis cerita Anda di sini..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Meta Sidebar */}
                    <aside className="w-80 md:w-96 bg-gray-50 border-l border-gray-200 overflow-y-auto p-6 space-y-8 custom-scrollbar hidden lg:block">
                        <section className="space-y-4">
                            <h3 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                <Layout className="w-3.5 h-3.5" />
                                Pengaturan Publikasi
                            </h3>
                            <div className="space-y-4 p-5 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pilih Status</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-sm text-gray-900"
                                    >
                                        <option value="Draft">Simpan sebagai Draft</option>
                                        <option value="Published">Terbitkan Sekarang</option>
                                        <option value="Archived">Arsipkan Berita</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                <ImageIcon className="w-3.5 h-3.5" />
                                Gambar Sampul
                            </h3>
                            <div className="space-y-4">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative aspect-video rounded-3xl border-2 border-dashed border-gray-200 bg-white hover:border-green-400 hover:bg-green-50 cursor-pointer transition-all overflow-hidden group"
                                >
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} alt="Cover" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 scale-90">
                                                    <Upload className="w-4 h-4 text-green-600" />
                                                    <span className="text-xs font-black text-gray-700 uppercase tracking-wider">Ganti Gambar</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-white transition-colors">
                                                <Upload className="w-6 h-6 text-gray-300 group-hover:text-green-500" />
                                            </div>
                                            <p className="text-xs font-black text-gray-400 group-hover:text-green-600 uppercase tracking-widest">Unggah Cover</p>
                                            <p className="text-[10px] text-gray-300 font-bold mt-1 uppercase tracking-tight">Format: JPG, PNG (Max 2MB)</p>
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </div>
                                {imagePreview && (
                                    <button
                                        onClick={() => { setImagePreview(null); setImageFile(null); }}
                                        className="w-full py-2.5 text-red-500 hover:bg-red-50 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                                    >
                                        Hapus Sampul
                                    </button>
                                )}
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                <Eye className="w-3.5 h-3.5" />
                                Ringkasan (SEO)
                            </h3>
                            <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Kutipan Berita</label>
                                <textarea
                                    value={excerpt}
                                    onChange={(e) => setExcerpt(e.target.value)}
                                    rows={4}
                                    className="w-full text-sm font-bold text-gray-700 bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-green-500 outline-none resize-none placeholder:text-gray-300 transition-all"
                                    placeholder="Tulis ringkasan singkat untuk hasil pencarian dan media sosial..."
                                />
                                <div className="flex justify-end">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${excerpt.length > 160 ? 'text-orange-500' : 'text-gray-400'}`}>
                                        {excerpt.length}/160
                                    </span>
                                </div>
                            </div>
                        </section>
                    </aside>
                </main>

                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #e5e7eb;
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #d1d5db;
                    }
                    .prose p { margin-top: 1em; margin-bottom: 1em; }
                    /* Make RichTextEditor borderless for focused experience */
                    .rich-text-editor-container { 
                        border: none !important;
                        box-shadow: none !important;
                    }
                `}</style>
            </motion.div>
        </AnimatePresence>
    );
}
