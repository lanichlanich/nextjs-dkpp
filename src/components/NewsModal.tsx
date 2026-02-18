"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { X, Save, Loader2, Upload, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { createNewsAction, updateNewsAction } from "@/actions/news";
import { NewsItem } from "@/lib/news";
import { RichTextEditor } from "./RichTextEditor";
import { compressImage } from "@/lib/imageUtils";

interface NewsModalProps {
    isOpen: boolean;
    onClose: () => void;
    newsItem?: NewsItem | null; // If present, we are in Edit mode
}

export function NewsModal({ isOpen, onClose, newsItem }: NewsModalProps) {
    const [isPending, startTransition] = useTransition();
    const [content, setContent] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isEdit = !!newsItem;

    // Sync state with newsItem
    useEffect(() => {
        if (isOpen) {
            setContent(newsItem?.content || "");
            setImagePreview(newsItem?.image || null);
            setImageFile(null);
        }
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        // Explicitly set content to ensure rich text is captured
        formData.set("content", content);

        startTransition(async () => {
            try {
                // If there's a new image, compress it first
                if (imageFile) {
                    const compressedBlob = await compressImage(imageFile, 1280, 720, 0.8);
                    const fileToUpload = new File([compressedBlob], imageFile.name, { type: 'image/jpeg' });
                    formData.set("image", fileToUpload);
                } else if (isEdit && newsItem?.image) {
                    // Keep existing image string if no new file is selected
                    formData.set("image", newsItem.image);
                }

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
            } catch (err: any) {
                Swal.fire({
                    title: "Gagal",
                    text: `Kesalahan: ${err.message}`,
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
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Cover Berita (Auto 720p)</label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative h-[46px] w-full border border-gray-200 rounded-xl flex items-center px-4 bg-white hover:bg-gray-50 cursor-pointer transition-all group overflow-hidden"
                                    >
                                        <Upload className={`w-4 h-4 mr-2 ${imageFile ? "text-green-600" : "text-gray-400"}`} />
                                        <span className={`text-sm font-medium line-clamp-1 flex-1 ${imageFile ? "text-green-700" : "text-gray-500"}`}>
                                            {imageFile ? imageFile.name : "Pilih file gambar..."}
                                        </span>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                            </div>

                            {imagePreview && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-dashed border-gray-100 bg-gray-50 group"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4 text-green-600" />
                                            <span className="text-xs font-bold text-gray-700">Preview Gambar</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImagePreview(null);
                                            setImageFile(null);
                                            if (fileInputRef.current) fileInputRef.current.value = "";
                                        }}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            )}

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
