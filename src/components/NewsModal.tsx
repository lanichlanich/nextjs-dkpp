"use client";

import { useState, useTransition, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { createNewsAction, updateNewsAction } from "@/actions/news";
import { NewsItem } from "@/lib/news";
import { RichTextEditor } from "./RichTextEditor";

interface NewsModalProps {
    isOpen: boolean;
    onClose: () => void;
    newsItem?: NewsItem | null; // If present, we are in Edit mode
}

export function NewsModal({ isOpen, onClose, newsItem }: NewsModalProps) {
    const [isPending, startTransition] = useTransition();
    const [content, setContent] = useState("");
    const isEdit = !!newsItem;

    // Sync content state with newsItem
    useEffect(() => {
        if (isOpen) {
            setContent(newsItem?.content || "");
        }
    }, [isOpen, newsItem]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        // Explicitly set content to ensure rich text is captured
        formData.set("content", content);

        startTransition(async () => {
            const action = isEdit ? updateNewsAction.bind(null, newsItem.id) : createNewsAction;
            const result = await action(formData);

            if (result && 'error' in result) {
                Swal.fire({
                    title: "Gagal",
                    text: result.error,
                    icon: "error",
                    confirmButtonColor: "#10b981",
                });
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
                onClose();
            } else {
                Swal.fire({
                    title: "Gagal",
                    text: "Terjadi kesalahan saat menyimpan berita.",
                    icon: "error"
                });
            }
        });
    };

    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-green-50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {isEdit ? "Edit Berita" : "Tambah Berita Baru"}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/50 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Judul Berita</label>
                                <input
                                    type="text"
                                    name="title"
                                    defaultValue={newsItem?.title || ""}
                                    required
                                    placeholder="Masukkan judul berita..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                                    <select
                                        name="status"
                                        defaultValue={newsItem?.status || "Draft"}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white"
                                    >
                                        <option value="Draft">Draft</option>
                                        <option value="Published">Published</option>
                                        <option value="Archived">Archived</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">URL Gambar</label>
                                    <input
                                        type="url"
                                        name="image"
                                        defaultValue={newsItem?.image || ""}
                                        placeholder="https://images.unsplash.com/..."
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Kutipan (Excerpt)</label>
                                <textarea
                                    name="excerpt"
                                    rows={2}
                                    defaultValue={newsItem?.excerpt || ""}
                                    required
                                    placeholder="Ringkasan singkat berita..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Konten Lengkap</label>
                                <RichTextEditor
                                    value={content}
                                    onChange={setContent}
                                    placeholder="Tulis isi berita di sini..."
                                />
                                <input type="hidden" name="content" value={content} />
                            </div>

                            {/* Footer Buttons */}
                            <div className="pt-4 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all flex items-center disabled:opacity-50"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            {isEdit ? "Simpan Perubahan" : "Simpan Berita"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
