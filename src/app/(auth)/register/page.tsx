"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Shield, User as UserIcon } from "lucide-react";
import { registerUserAction } from "@/actions/users";
import Swal from "sweetalert2";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"Pegawai" | "Admin">("Pegawai");
    const [token, setToken] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("role", role);
        formData.append("token", token);

        const result = await registerUserAction(formData);

        setIsLoading(false);

        if (result.error) {
            Swal.fire({
                icon: "error",
                title: "Registrasi Gagal",
                text: result.error,
                confirmButtonColor: "#10b981",
            });
        } else {
            Swal.fire({
                icon: "success",
                title: "Registrasi Berhasil",
                text: "Akun Anda telah dibuat. Silakan login.",
                confirmButtonColor: "#10b981",
            }).then(() => {
                router.push("/login");
            });
        }
    };

    return (
        <div>
            <div className="mb-6 text-center">
                <h3 className="text-xl font-bold text-gray-800">Daftar Akun Baru</h3>
                <p className="text-sm text-gray-600">Buat akun untuk akses sistem.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Nama Lengkap
                    </label>
                    <input
                        id="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900 bg-white"
                        placeholder="Masukkan nama lengkap"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Alamat Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900 bg-white"
                        placeholder="nama@dkpp.id"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900 bg-white"
                        placeholder="••••••••"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pilih Peran (Role)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setRole("Pegawai")}
                            className={`flex items-center justify-center py-2 px-3 border rounded-md text-sm font-medium transition-colors ${role === "Pegawai"
                                ? "bg-green-50 border-green-500 text-green-700"
                                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <UserIcon className="w-4 h-4 mr-2" />
                            Pegawai
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole("Admin")}
                            className={`flex items-center justify-center py-2 px-3 border rounded-md text-sm font-medium transition-colors ${role === "Admin"
                                ? "bg-green-50 border-green-500 text-green-700"
                                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <Shield className="w-4 h-4 mr-2" />
                            Admin
                        </button>
                    </div>
                </div>

                {role === "Admin" && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                        <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                            Token Verifikasi Admin
                        </label>
                        <input
                            id="token"
                            type="password"
                            required
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-yellow-300 bg-yellow-50 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm text-gray-900"
                            placeholder="Masukkan kode rahasia"
                        />
                        <p className="mt-1 text-xs text-yellow-600 font-medium">
                            * Diperlukan untuk hak akses Administrator.
                        </p>
                    </div>
                )}

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover-lift"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                Memproses...
                            </>
                        ) : (
                            <>
                                Daftar Sekarang
                                <ArrowRight className="ml-2 -mr-1 h-4 w-4" />
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 font-medium">
                    Sudah punya akun?{" "}
                    <Link href="/login" className="text-green-600 hover:text-green-500">
                        Masuk di sini
                    </Link>
                </p>
                <div className="mt-4">
                    <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 border-b border-transparent hover:border-gray-400">
                        &larr; Kembali ke Beranda
                    </Link>
                </div>
            </div>
        </div>
    );
}
