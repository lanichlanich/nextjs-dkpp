import { getJdihDocuments } from "@/lib/jdih";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer"; // Assuming Footer exists based on other pages
import { JdihPublicTable } from "@/components/JdihPublicTable";
import { Scale, Search, ShieldCheck, Globe, Download } from "lucide-react";

export default async function JdihPage() {
    const documents = await getJdihDocuments();

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            {/* Hero Section */}
            <section className="relative py-20 bg-gradient-to-br from-green-900 via-green-800 to-blue-900 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 mx-auto md:mx-0">
                                <Scale className="w-4 h-4 text-green-400" />
                                <span className="text-xs font-black uppercase tracking-widest">JDIH DKPP INDRAMAYU</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                                Transparansi Informasi <span className="text-green-400">Produk Hukum</span>
                            </h1>
                            <p className="text-lg text-green-100/80 mb-8 max-w-xl">
                                Akses mudah ke Jaringan Dokumentasi dan Informasi Hukum Kabupaten Indramayu. Cari dan unduh peraturan daerah secara digital.
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/10 font-bold text-sm">
                                    <ShieldCheck className="w-5 h-5 text-green-400" />
                                    Resmi & Terverifikasi
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/10 font-bold text-sm">
                                    <Globe className="w-5 h-5 text-blue-400" />
                                    Bagian dari JDIHN
                                </div>
                            </div>
                        </div>
                        <div className="hidden lg:block flex-shrink-0">
                            <div className="relative">
                                <Scale className="w-64 h-64 text-green-400/20" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-48 h-48 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 rotate-12 flex items-center justify-center">
                                        <FileText className="w-24 h-24 text-white/40 -rotate-12" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-12 -mt-10 relative z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-6 md:p-10 border border-slate-100">
                        <JdihPublicTable initialDocuments={documents} />
                    </div>
                </div>
            </section>

            {/* Features Info */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all group">
                            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
                                <Search className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-black mb-4 group-hover:text-green-600 transition-colors">Pencarian Cepat</h3>
                            <p className="text-gray-500 leading-relaxed">Cari dokumen berdasarkan judul, nomor, atau tahun dengan fitur pencarian instan kami.</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all group">
                            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                                <Download className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-black mb-4 group-hover:text-blue-600 transition-colors">Unduh Digital</h3>
                            <p className="text-gray-500 leading-relaxed">Unduh salinan resmi produk hukum dalam format PDF secara langsung tanpa biaya.</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all group">
                            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-black mb-4 group-hover:text-purple-600 transition-colors">Data Akurat</h3>
                            <p className="text-gray-500 leading-relaxed">Data yang disajikan berasal langsung dari arsip resmi DKPP Kabupaten Indramayu.</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

// Minimal placeholder for JdihPublicTable until created
import { FileText } from "lucide-react";
