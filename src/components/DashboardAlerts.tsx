"use client";

import { Cake, Clock } from "lucide-react";
import { EmployeeDisplay } from "@/lib/employees";
import { motion } from "framer-motion";

interface DashboardAlertsProps {
    employees: EmployeeDisplay[];
}

export function DashboardAlerts({ employees }: DashboardAlertsProps) {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentYear = today.getFullYear();

    // 1. Birthdays Today
    const birthdaysToday = employees.filter(emp =>
        emp.birthDay === currentDay && emp.birthMonth === currentMonth
    );

    // 2. Upcoming Birthdays (Next 7 days)
    const upcomingBirthdays = employees.filter(emp => {
        for (let i = 1; i <= 7; i++) {
            const checkDate = new Date();
            checkDate.setDate(today.getDate() + i);
            if (emp.birthDay === checkDate.getDate() && emp.birthMonth === (checkDate.getMonth() + 1)) {
                (emp as any).daysUntil = i;
                return true;
            }
        }
        return false;
    }).sort((a, b) => (a as any).daysUntil - (b as any).daysUntil);

    // 3. Retirement This Year
    const retiringThisYear = employees.filter(e => e.isRetiringThisYear);

    // 4. Retirement 1-2 Years (Upcoming)
    const retiringSoon = employees.filter(emp => {
        if (!emp.retirementYear) return false;
        const yearsLeft = emp.retirementYear - currentYear;
        return yearsLeft >= 1 && yearsLeft <= 2;
    }).map(emp => ({
        ...emp,
        yearsLeft: (emp.retirementYear || 0) - currentYear
    })).sort((a, b) => a.yearsLeft - b.yearsLeft);

    const hasAlerts = birthdaysToday.length > 0 || upcomingBirthdays.length > 0 || retiringThisYear.length > 0 || retiringSoon.length > 0;

    if (!hasAlerts) return null;

    return (
        <div className="space-y-6">
            {/* Birthday Section */}
            {(birthdaysToday.length > 0 || upcomingBirthdays.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {birthdaysToday.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl p-6 shadow-xl shadow-rose-100 text-white relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <Cake className="w-32 h-32" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Cake className="w-6 h-6 text-white" />
                                    </div>
                                    <h2 className="text-xl font-black uppercase tracking-wider">Ulang Tahun Hari Ini!</h2>
                                </div>
                                <div className="space-y-3">
                                    {birthdaysToday.map(emp => (
                                        <div key={emp.id} className="flex items-center justify-between bg-white/10 hover:bg-white/20 p-3 rounded-2xl backdrop-blur-sm transition-colors cursor-default">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center font-black text-xs">
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <span className="font-bold">{emp.name}</span>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-tighter bg-white text-rose-600 px-2 py-1 rounded-lg shadow-sm">
                                                Barakallah!
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {upcomingBirthdays.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-gray-900 relative overflow-hidden group"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-50 rounded-xl">
                                    <Clock className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider">Akan Datang</h2>
                            </div>
                            <div className="space-y-3">
                                {upcomingBirthdays.map(emp => (
                                    <div key={emp.id} className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-3 rounded-2xl transition-colors cursor-default border border-gray-100/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xs">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-gray-800">{emp.name}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                                                {(emp as any).daysUntil === 1 ? 'Besok' : `${(emp as any).daysUntil} hari lagi`}
                                            </span>
                                            <span className="text-[9px] text-gray-400 font-bold">{emp.birthDate.split(' ').slice(0, 2).join(' ')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {/* Retirement Section */}
            {(retiringThisYear.length > 0 || retiringSoon.length > 0) && (
                <div className="space-y-6">
                    {retiringThisYear.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 rounded-3xl p-6 shadow-sm border border-red-100 text-gray-900 relative overflow-hidden group"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-100 rounded-xl">
                                    <Clock className="w-6 h-6 text-red-600" />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider">Pensiun Tahun Ini ({currentYear})</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {retiringThisYear.map(emp => (
                                    <div key={emp.id} className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border-l-4 border-red-500">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-black text-lg">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 line-clamp-1">{emp.name}</div>
                                                <div className="text-xs text-gray-500 line-clamp-1">{emp.position?.namaJabatan || '-'}</div>
                                                <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wide">
                                                    TMT: {emp.tmtPensiun}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {retiringSoon.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-orange-50 rounded-3xl p-6 shadow-sm border border-orange-100 text-gray-900 relative overflow-hidden group"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-orange-100 rounded-xl">
                                    <Clock className="w-6 h-6 text-orange-600" />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider">Pensiun 1 sd 2 Tahun Ke Depan</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {retiringSoon.map(emp => (
                                    <div key={emp.id} className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border-l-4 border-orange-500 transition-all hover:shadow-md">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black text-lg">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 line-clamp-1">{emp.name}</div>
                                                <div className="text-xs text-gray-500 line-clamp-1">{emp.position?.namaJabatan || '-'}</div>
                                                <div className="mt-1 flex flex-wrap gap-2">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-orange-100 text-orange-700 uppercase tracking-widest">
                                                        Tahun: {emp.retirementYear}
                                                    </span>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-gray-100 text-gray-600 uppercase tracking-widest">
                                                        {emp.yearsLeft} Tahun Lagi
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
}
