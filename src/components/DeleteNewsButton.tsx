"use client";

import { deleteNewsAction } from "@/actions/news";
import { Trash } from "lucide-react";
import { useTransition } from "react";
import Swal from "sweetalert2";

export function DeleteNewsButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();

    return (
        <button
            onClick={() => {
                Swal.fire({
                    title: "Apakah anda yakin?",
                    text: "Data berita ini akan dihapus permanen!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    cancelButtonColor: "#3085d6",
                    confirmButtonText: "Ya, Hapus!",
                    cancelButtonText: "Batal"
                }).then((result) => {
                    if (result.isConfirmed) {
                        startTransition(async () => {
                            const result = await deleteNewsAction(id);

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
                                    title: "Terhapus!",
                                    text: result.message,
                                    icon: "success",
                                    timer: 1500,
                                    showConfirmButton: false
                                });
                            }
                        });
                    }
                });
            }}
            disabled={isPending}
            className="text-red-600 hover:text-red-900 disabled:opacity-50"
        >
            <Trash className="w-4 h-4" />
        </button>
    );
}
