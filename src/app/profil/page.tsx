import { getProfileData } from "@/lib/profile";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
    Scale,
    Network,
    Briefcase,
    UserCheck,
    ChevronRight,
    Building2,
    Shield
} from "lucide-react";

export default async function ProfilePage() {
    const data = await getProfileData();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
                            Profil & Organisasi
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
                            Dinas Ketahanan Pangan dan Pertanian Kabupaten Indramayu
                        </p>
                        <div className="w-24 h-1.5 bg-green-600 mx-auto mt-8 rounded-full shadow-lg shadow-green-200"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* 1. Dasar Hukum */}
                        <section className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 hover:border-blue-200 transition-colors group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                    <Scale className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Dasar Hukum & Regulasi</h2>
                            </div>
                            <ul className="space-y-4">
                                {data.dasarHukum.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-700 font-medium">
                                        <ChevronRight className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* 2. Struktur Organisasi */}
                        <section className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 hover:border-green-200 transition-colors group lg:row-span-2">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Struktur Organisasi</h2>
                            </div>

                            <div className="space-y-8">
                                <div className="text-center p-6 bg-green-900 text-white rounded-2xl shadow-xl">
                                    <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">Kepala Dinas</p>
                                    <p className="text-xl font-bold">{data.strukturOrganisasi.pimpinan}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <ChevronRight className="w-4 h-4 text-green-600" />
                                        Sekretariat
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {data.strukturOrganisasi.sekretariat.map((item, i) => (
                                            <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 font-bold text-gray-700 flex items-center gap-3">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <ChevronRight className="w-4 h-4 text-green-600" />
                                        Bidang-Bidang
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {data.strukturOrganisasi.bidang.map((item, i) => (
                                            <div key={i} className="p-4 bg-white border border-gray-200 rounded-xl font-bold text-gray-800 flex items-center gap-3 hover:translate-x-2 transition-transform cursor-default">
                                                <Building2 className="w-5 h-5 text-green-600" />
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. Tugas Pokok */}
                        <section className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 hover:border-orange-200 transition-colors group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                                    <Briefcase className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Tugas Pokok & Fungsi</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {data.tugasFungsi.map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-orange-50/50 rounded-2xl text-gray-800 font-bold border border-orange-100/50">
                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-orange-600 shadow-sm font-black text-xs">{i + 1}</div>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 4. UPTD */}
                        <section className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 hover:border-purple-200 transition-colors group lg:col-span-2">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                                    <Network className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Unit Pelaksana Teknis Daerah (UPTD)</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div>
                                    <h3 className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-black uppercase tracking-widest mb-6 inline-block">UPTD Kelas A</h3>
                                    <ul className="space-y-3">
                                        {data.uptd.kelasA.map((item, i) => (
                                            <li key={i} className="text-sm font-bold text-gray-700 flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 shrink-0"></div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-black uppercase tracking-widest mb-6 inline-block">UPTD Kelas B</h3>
                                    <ul className="space-y-3">
                                        {data.uptd.kelasB.map((item, i) => (
                                            <li key={i} className="text-sm font-bold text-gray-700 flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 shrink-0"></div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-black uppercase tracking-widest mb-6 inline-block">Non Struktural</h3>
                                    <ul className="space-y-3">
                                        {data.uptd.nonStruktural.map((item, i) => (
                                            <li key={i} className="text-sm font-bold text-gray-700 flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 shrink-0"></div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 5. Jabatan */}
                        <section className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 hover:border-teal-200 transition-colors group lg:col-span-2">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform">
                                    <UserCheck className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Jabatan & Tata Kerja</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {data.jabatanTataKerja.map((item, i) => (
                                    <div key={i} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center font-bold text-gray-800 hover:bg-teal-50 transition-colors">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
