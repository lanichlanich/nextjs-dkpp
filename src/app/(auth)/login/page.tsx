"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { loginAction } from "@/actions/auth";
import Swal from "sweetalert2";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);

        const result = await loginAction(formData);

        setIsLoading(false);

        if (result.error) {
            Swal.fire({
                icon: "error",
                title: "Login Gagal",
                text: result.error,
                confirmButtonColor: "#10b981",
            });
        } else {
            router.push("/admin/dashboard");
        }
    };

    return (
        <div>
            <div className="mb-6 text-center">
                <h3 className="text-xl font-bold text-gray-800">Login Pegawai</h3>
                <p className="text-sm text-gray-600">Masukan kredensial anda untuk mengakses dashboard.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                    </label>
                    <div className="mt-1">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900 bg-white"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <div className="mt-1">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900 bg-white"
                        />
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Sign in
                                <ArrowRight className="ml-2 -mr-1 h-4 w-4" />
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Belum punya akun?{" "}
                        <Link href="/register" className="font-medium text-green-600 hover:text-green-500">
                            Daftar disini
                        </Link>
                    </p>
                    <div className="mt-2">
                        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                            &larr; Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
