import { Newspaper, Users, Briefcase, TrendingUp, Clock, FileText, CheckCircle } from "lucide-react";
import { getNews } from "@/lib/news";
import { getEmployees } from "@/lib/employees";
import { getPositions } from "@/lib/positions";
import Link from "next/link";
import { DashboardCharts } from "@/components/DashboardCharts";

export default async function DashboardPage() {
    const [news, employees, positions] = await Promise.all([
        getNews(),
        getEmployees(),
        getPositions()
    ]);

    // --- Stats Calculations ---

    // News Stats
    const totalNews = news.length;
    const publishedNews = news.filter(item => item.status === "Published").length;

    // Employee Stats
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.keaktifan === "Aktif").length;
    const pnsCount = employees.filter(e => e.status === "PNS" || e.status === "CPNS").length;
    const pppkCount = employees.filter(e => e.status.includes("PPPK")).length;

    // Chart Data Preparation
    const employeeStatusStats = [
        { name: 'PNS/CPNS', value: pnsCount },
        { name: 'PPPK', value: pppkCount },
        { name: 'Outsourcing', value: employees.filter(e => e.status === "Outsourcing").length },
    ].filter(item => item.value > 0);

    const genderStats = [
        { name: 'Laki-laki', value: employees.filter(e => e.gender === "Laki-laki").length },
        { name: 'Perempuan', value: employees.filter(e => e.gender === "Perempuan").length },
    ];

    // Position Stats (Group by Jenis Jabatan)
    const positionTypeCounts = employees.reduce((acc, emp) => {
        const type = emp.position?.jenisJabatan || 'Belum Ada Jabatan';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const positionStats = Object.entries(positionTypeCounts).map(([name, value]) => ({ name, value }));

    // Recent Activities
    const recentActivities = [...news]
        .sort((a, b) => b.id.localeCompare(a.id))
        .slice(0, 5);

    // Summary Cards
    const summaryCards = [
        {
            title: 'Total Pegawai',
            value: totalEmployees,
            icon: Users,
            desc: 'Pegawai Terdaftar',
            color: 'bg-blue-600',
            textColor: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Pegawai Aktif',
            value: activeEmployees,
            icon: CheckCircle,
            desc: 'Status Keaktifan: Aktif',
            color: 'bg-green-600',
            textColor: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Berita Terbit',
            value: publishedNews,
            icon: Newspaper,
            desc: `${totalNews} Total Berita`,
            color: 'bg-purple-600',
            textColor: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            title: 'Jabatan Terisi',
            value: employees.filter(e => e.positionId).length,
            icon: Briefcase,
            desc: `${positions.length} Total Jabatan`,
            color: 'bg-orange-600',
            textColor: 'text-orange-600',
            bgColor: 'bg-orange-50'
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1 font-medium">Ringkasan statistik dan aktivitas terbaru.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryCards.map((card, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${card.bgColor}`}>
                                <card.icon className={`w-6 h-6 ${card.textColor}`} />
                            </div>
                            <span className={`text-2xl font-black ${card.textColor}`}>
                                {card.value}
                            </span>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{card.title}</h3>
                            <p className="text-xs text-gray-400 font-bold mt-1">{card.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Component */}
            <DashboardCharts
                employeeStats={{
                    status: employeeStatusStats,
                    gender: genderStats,
                    positions: positionStats
                }}
            />

            {/* Recent News */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-black text-gray-900">Berita Terbaru</h2>
                    <Link
                        href="/admin/news"
                        className="text-sm font-bold text-green-600 hover:text-green-700 hover:underline"
                    >
                        Lihat Semua
                    </Link>
                </div>
                <div className="space-y-4">
                    {recentActivities.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100/50">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-6 h-6 text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 truncate">{item.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${item.status === 'Published' ? 'bg-green-100 text-green-700' :
                                            item.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {item.status}
                                    </span>
                                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {item.date}
                                    </span>
                                </div>
                            </div>
                            <Link
                                href={`/admin/news/${item.id}/edit`}
                                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Edit
                            </Link>
                        </div>
                    ))}
                    {recentActivities.length === 0 && (
                        <div className="text-center py-8 text-gray-400 font-medium">
                            Belum ada berita yang ditambahkan.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
