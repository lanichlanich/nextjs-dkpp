import { Newspaper, Users, Briefcase, TrendingUp, Clock, FileText, CheckCircle, ArrowRight } from "lucide-react";
import { getNews } from "@/lib/news";
import { getEmployees } from "@/lib/employees";
import { getPositions } from "@/lib/positions";
import Link from "next/link";
import { DashboardCharts } from "@/components/DashboardCharts";
import { DashboardAlerts } from "@/components/DashboardAlerts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

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
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
                <p className="text-slate-500 mt-1.5 font-medium">Ringkasan statistik data pegawai dan aktivitas berita terbaru.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryCards.map((card, idx) => (
                    <Card key={idx} className="border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-5">
                                <div className={cn("p-3 rounded-xl transition-colors", card.bgColor, "group-hover:bg-white border border-transparent group-hover:border-slate-100 group-hover:shadow-inner")}>
                                    <card.icon className={cn("w-6 h-6", card.textColor)} />
                                </div>
                                <span className={cn("text-3xl font-black tracking-tight", card.textColor)}>
                                    {card.value}
                                </span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm italic uppercase tracking-wider opacity-70">{card.title}</h3>
                                <p className="text-xs text-slate-400 font-bold mt-1.5">{card.desc}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Alerts & Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                <div className="xl:col-span-1">
                    <DashboardAlerts employees={employees} />
                </div>
                <div className="xl:col-span-3">
                    <DashboardCharts
                        employeeStats={{
                            status: employeeStatusStats,
                            gender: genderStats,
                            positions: positionStats
                        }}
                    />
                </div>
            </div>

            {/* Recent News Card */}
            <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0 px-8 pt-8">
                    <div>
                        <CardTitle className="text-xl font-black text-slate-900">Berita Terbaru</CardTitle>
                        <CardDescription className="text-slate-400 font-medium mt-1">Status dan pembaruan konten publikasi</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" render={<Link href="/admin/news" />} className="rounded-xl font-bold border-slate-200 text-slate-600 hover:text-green-700 hover:bg-green-50">
                        <span className="flex items-center gap-2">
                            Lihat Semua <ArrowRight className="w-4 h-4" />
                        </span>
                    </Button>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <div className="space-y-3.5 mt-4">
                        {recentActivities.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-slate-100/50 group">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:shadow-sm transition-colors">
                                    <FileText className="w-6 h-6 text-slate-400 group-hover:text-green-600 transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-900 truncate group-hover:text-green-700 transition-colors">{item.title}</h4>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <Badge
                                            variant={item.status === 'Published' ? "success" : item.status === 'Draft' ? "warning" : "secondary"}
                                            className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md"
                                        >
                                            {item.status}
                                        </Badge>
                                        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {item.date}
                                        </span>
                                    </div>
                                </div>
                                <div className="hidden sm:block">
                                    <Button variant="ghost" size="sm" render={<Link href={`/admin/news/${item.id}/edit`} />} className="rounded-lg font-bold text-slate-500 hover:text-green-600">
                                        Edit
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {recentActivities.length === 0 && (
                            <div className="text-center py-12 rounded-3xl border-2 border-dashed border-slate-100">
                                <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-400 font-bold">Belum ada berita yang ditambahkan.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
