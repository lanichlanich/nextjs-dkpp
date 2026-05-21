"use client";

import { useState, useMemo } from "react";
import { Sprout, Download, TrendingUp, BarChart3, Layers, Calendar, ChevronRight, HelpCircle } from "lucide-react";
import { AgricultureProduction } from "@/lib/agriculture";
import { motion, AnimatePresence } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface AgriculturePublicDashboardProps {
    initialData: AgricultureProduction[];
}

export function AgriculturePublicDashboard({ initialData }: AgriculturePublicDashboardProps) {
    const [selectedCommodity, setSelectedCommodity] = useState<string>("Padi");
    const [activeMetric, setActiveMetric] = useState<"produksi" | "produktivitas" | "luasPanen">("produksi");

    // All available commodities in database or fallback to options
    const commodities = useMemo(() => {
        const unique = Array.from(new Set(initialData.map(item => item.komoditas)));
        // If empty, return standard list
        return unique.length > 0 ? unique : ["Padi", "Mangga", "Tebu", "Daging", "Telur"];
    }, [initialData]);

    // Ensure selected commodity is in the list
    useMemo(() => {
        if (commodities.length > 0 && !commodities.includes(selectedCommodity)) {
            setSelectedCommodity(commodities[0]);
        }
    }, [commodities, selectedCommodity]);

    // Filter data for selected commodity, sorted by year ascending for chart
    const filteredData = useMemo(() => {
        return initialData
            .filter(item => item.komoditas.toLowerCase() === selectedCommodity.toLowerCase())
            .sort((a, b) => a.tahun - b.tahun);
    }, [initialData, selectedCommodity]);

    // Reverse sorted for table view (latest year first)
    const tableData = useMemo(() => {
        return [...filteredData].sort((a, b) => b.tahun - a.tahun);
    }, [filteredData]);

    // Latest year's record
    const latestRecord = useMemo(() => {
        if (filteredData.length === 0) return null;
        return filteredData[filteredData.length - 1];
    }, [filteredData]);

    // Formatter for card values matching reference HTML "1.62 JT", "228 RB"
    const formatCardValue = (value: number | null | undefined, unit: string, isInteger = false) => {
        if (value === null || value === undefined) return "N/A";
        
        if (value >= 1000000) {
            return `${(value / 1000000).toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} JT`;
        }
        if (value >= 1000) {
            return `${(value / 1000).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 1 })} RB`;
        }
        
        return isInteger 
            ? value.toLocaleString("id-ID", { maximumFractionDigits: 0 })
            : value.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
    };

    // Download dynamic data as CSV
    const handleDownloadCSV = () => {
        if (filteredData.length === 0) return;

        const headers = ["TAHUN", "KOMODITAS", "JUMLAH PRODUKSI (TON)", "PRODUKTIVITAS (TON/HA)", "LUAS PANEN (HA)"];
        const rows = filteredData.map(item => [
            item.tahun,
            item.komoditas.toUpperCase(),
            item.produksi,
            item.produktivitas !== null && item.produktivitas !== undefined ? item.produktivitas : "-",
            item.luasPanen !== null && item.luasPanen !== undefined ? item.luasPanen : "-"
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `statistik_pertanian_${selectedCommodity.toLowerCase()}_indramayu.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Chart customization
    const metricLabel = {
        produksi: "Jumlah Produksi",
        produktivitas: "Produktivitas",
        luasPanen: "Luas Panen"
    };

    const metricUnit = {
        produksi: "Ton",
        produktivitas: "Ton/Ha",
        luasPanen: "Ha"
    };

    const metricColor = {
        produksi: "#10b981", // Emerald
        produktivitas: "#3b82f6", // Blue
        luasPanen: "#f59e0b" // Amber
    };

    const isLivestock = selectedCommodity === "Daging" || selectedCommodity === "Telur";

    // Custom tooltip for Recharts
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-slate-900/90 text-white p-4 rounded-2xl shadow-xl border border-white/10 backdrop-blur-md text-xs font-sans">
                    <p className="font-black text-emerald-400 mb-1.5 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Tahun {label}
                    </p>
                    <div className="space-y-1 font-semibold text-slate-200">
                        <p>Produksi: <span className="font-extrabold text-white">{data.produksi.toLocaleString("id-ID")} Ton</span></p>
                        {data.produktivitas !== null && data.produktivitas !== undefined && (
                            <p>Produktivitas: <span className="font-extrabold text-white">{data.produktivitas.toLocaleString("id-ID")} Ton/Ha</span></p>
                        )}
                        {data.luasPanen !== null && data.luasPanen !== undefined && (
                            <p>Luas Panen: <span className="font-extrabold text-white">{data.luasPanen.toLocaleString("id-ID")} Ha</span></p>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen relative overflow-hidden font-sans">
            {/* Ambient Background Circles */}
            <div className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-emerald-100/40 rounded-full blur-[100px] z-[-1] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[45rem] h-[45rem] bg-blue-50/50 rounded-full blur-[120px] z-[-1] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200/50 rounded-full">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black tracking-wider uppercase text-emerald-700">Statistik Sektoral</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                            Produksi & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">Komoditas Pertanian</span>
                        </h1>
                        <p className="text-slate-650 max-w-2xl text-sm md:text-base font-medium leading-relaxed">
                            Dashboard interaktif pemantauan statistik produksi, produktivitas, dan luas panen komoditas di wilayah Kabupaten Indramayu.
                        </p>
                    </div>

                    {/* Commodity selector */}
                    <div className="flex flex-col space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pilih Komoditi</label>
                        <select
                            value={selectedCommodity}
                            onChange={(e) => setSelectedCommodity(e.target.value)}
                            className="bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-100/40 px-6 py-4 text-slate-900 font-extrabold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-base outline-none cursor-pointer min-w-[200px]"
                        >
                            {commodities.map(c => (
                                <option key={c} value={c}>{c.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Card 1: Produksi */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-slate-200/40 transition-all hover:translate-y-[-4px] relative overflow-hidden group"
                    >
                        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-emerald-50 rounded-full blur-[20px] group-hover:bg-emerald-100/70 transition-colors pointer-events-none" />
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 mb-6 shadow-md shadow-emerald-50 group-hover:scale-110 transition-transform">
                            <Sprout className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-black text-slate-450 tracking-widest uppercase">Produksi Terakhir</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-3 tracking-tight">
                            {latestRecord ? formatCardValue(latestRecord.produksi, "Ton") : "N/A"}
                        </h2>
                        <p className="text-slate-500 text-xs mt-3 font-semibold">
                            Total produksi {selectedCommodity.toLowerCase()} tahun {latestRecord?.tahun || "N/A"} (Ton)
                        </p>
                    </motion.div>

                    {/* Card 2: Produktivitas */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-slate-200/40 transition-all hover:translate-y-[-4px] relative overflow-hidden group"
                    >
                        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-blue-50 rounded-full blur-[20px] group-hover:bg-blue-100/70 transition-colors pointer-events-none" />
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 mb-6 shadow-md shadow-blue-50 group-hover:scale-110 transition-transform">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-black text-slate-450 tracking-widest uppercase">Produktivitas</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-3 tracking-tight">
                            {isLivestock ? "N/A" : latestRecord ? formatCardValue(latestRecord.produktivitas, "Ton/Ha") : "N/A"}
                        </h2>
                        <p className="text-slate-500 text-xs mt-3 font-semibold">
                            Rata-rata produktivitas per Hektar tahun {latestRecord?.tahun || "N/A"}
                        </p>
                    </motion.div>

                    {/* Card 3: Luas Panen */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-slate-200/40 transition-all hover:translate-y-[-4px] relative overflow-hidden group"
                    >
                        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-amber-50 rounded-full blur-[20px] group-hover:bg-amber-100/70 transition-colors pointer-events-none" />
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 mb-6 shadow-md shadow-amber-50 group-hover:scale-110 transition-transform">
                            <Layers className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-black text-slate-450 tracking-widest uppercase">Luas Panen</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-3 tracking-tight">
                            {isLivestock ? "N/A" : latestRecord ? formatCardValue(latestRecord.luasPanen, "Ha", true) : "N/A"}
                        </h2>
                        <p className="text-slate-500 text-xs mt-3 font-semibold">
                            Total luas panen yang dipanen tahun {latestRecord?.tahun || "N/A"}
                        </p>
                    </motion.div>
                </div>

                {/* Dashboard Grid (Chart + Table) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Visualisasi Tren Chart */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-slate-100/50">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Visualisasi Tren Produksi</h3>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-200/55">
                                    <button
                                        onClick={() => setActiveMetric("produksi")}
                                        className={cn(
                                            "text-xs px-3.5 py-2 font-black rounded-xl transition-all cursor-pointer",
                                            activeMetric === "produksi"
                                                ? "bg-white text-emerald-600 shadow-sm border border-slate-200/40"
                                                : "text-slate-550 hover:text-slate-800"
                                        )}
                                    >
                                        Produksi
                                    </button>
                                    <button
                                        onClick={() => setActiveMetric("produktivitas")}
                                        disabled={isLivestock}
                                        className={cn(
                                            "text-xs px-3.5 py-2 font-black rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
                                            activeMetric === "produktivitas"
                                                ? "bg-white text-blue-600 shadow-sm border border-slate-200/40"
                                                : "text-slate-550 hover:text-slate-800"
                                        )}
                                    >
                                        Produktivitas
                                    </button>
                                    <button
                                        onClick={() => setActiveMetric("luasPanen")}
                                        disabled={isLivestock}
                                        className={cn(
                                            "text-xs px-3.5 py-2 font-black rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
                                            activeMetric === "luasPanen"
                                                ? "bg-white text-amber-600 shadow-sm border border-slate-200/40"
                                                : "text-slate-550 hover:text-slate-800"
                                        )}
                                    >
                                        Luas Panen
                                    </button>
                                </div>
                            </div>

                            {/* Chart Container */}
                            <div className="h-[360px] w-full">
                                {filteredData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            data={filteredData}
                                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                        >
                                            <defs>
                                                <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={metricColor[activeMetric]} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={metricColor[activeMetric]} stopOpacity={0.0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="tahun"
                                                stroke="#94a3b8"
                                                fontSize={11}
                                                fontWeight={600}
                                                tickLine={false}
                                                axisLine={false}
                                                dy={10}
                                            />
                                            <YAxis
                                                stroke="#94a3b8"
                                                fontSize={11}
                                                fontWeight={600}
                                                tickLine={false}
                                                axisLine={false}
                                                dx={-10}
                                                tickFormatter={(val) => {
                                                    if (val >= 1000000) return `${(val / 1000000)}JT`;
                                                    if (val >= 1000) return `${(val / 1000)}RB`;
                                                    return val;
                                                }}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area
                                                type="monotone"
                                                dataKey={activeMetric}
                                                stroke={metricColor[activeMetric]}
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#metricGradient)"
                                                animationDuration={1000}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center space-y-3 opacity-60">
                                        <div className="p-4 bg-slate-50 rounded-full">
                                            <Sprout className="w-10 h-10 text-slate-350" />
                                        </div>
                                        <p className="text-slate-400 font-bold italic text-sm">
                                            Belum ada data visualisasi untuk komoditas ini.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Data Table Section */}
                    <div className="space-y-4">
                        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-slate-100/50 flex flex-col h-full justify-between">
                            <div>
                                <div className="flex items-center justify-between gap-4 mb-6">
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Data Produksi</h3>
                                    {filteredData.length > 0 && (
                                        <Button
                                            onClick={handleDownloadCSV}
                                            variant="outline"
                                            className="h-10 border-slate-200 hover:border-emerald-500 rounded-xl px-4 text-xs font-black text-slate-650 flex items-center hover:bg-emerald-50/50 hover:text-emerald-700 transition-colors"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </Button>
                                    )}
                                </div>

                                <div className="overflow-hidden border border-slate-100 rounded-2xl">
                                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-slate-55 border-b border-slate-100">
                                                    <th className="p-4 font-black uppercase text-slate-500">Tahun</th>
                                                    <th className="p-4 font-black uppercase text-slate-500">Produksi</th>
                                                    {!isLivestock && (
                                                        <th className="p-4 font-black uppercase text-slate-500">Produktivitas</th>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tableData.length > 0 ? (
                                                    tableData.map((item) => (
                                                        <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                                                            <td className="p-4 font-extrabold text-slate-900">{item.tahun}</td>
                                                            <td className="p-4 font-bold text-slate-700">{item.produksi.toLocaleString("id-ID")} Ton</td>
                                                            {!isLivestock && (
                                                                <td className="p-4 font-semibold text-slate-650">
                                                                    {item.produktivitas !== null && item.produktivitas !== undefined ? (
                                                                        `${item.produktivitas.toLocaleString("id-ID")} Ton/Ha`
                                                                    ) : (
                                                                        "-"
                                                                    )}
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={isLivestock ? 2 : 3} className="p-8 text-center text-slate-400 font-bold italic">
                                                            Data kosong
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-2 text-slate-400">
                                <HelpCircle className="w-4 h-4 flex-shrink-0" />
                                <p className="text-[10px] font-semibold leading-normal">
                                    Unduh data di atas untuk laporan lengkap statistik sektoral wilayah Kabupaten Indramayu.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Credits */}
                <div className="mt-16 text-center space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Dinas Ketahanan Pangan dan Pertanian Kabupaten Indramayu
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                        © {new Date().getFullYear()} Pemerintah Kabupaten Indramayu. Hak Cipta Dilindungi Undang-Undang.
                    </p>
                </div>
            </div>
        </div>
    );
}
