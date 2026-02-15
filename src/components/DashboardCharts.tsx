"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

interface DashboardChartsProps {
    employeeStats: {
        status: { name: string; value: number }[];
        gender: { name: string; value: number }[];
        positions: { name: string; value: number }[];
    };
}

const COLORS = ['#16a34a', '#dc2626', '#ca8a04', '#2563eb', '#9333ea'];

export function DashboardCharts({ employeeStats }: DashboardChartsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Employee Status Distribution */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            >
                <h3 className="text-lg font-black text-gray-900 mb-6">Status Kepegawaian</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={employeeStats.status}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {employeeStats.status.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Position Types */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            >
                <h3 className="text-lg font-black text-gray-900 mb-6">Jenis Jabatan</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={employeeStats.positions}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fontWeight: 600 }} />
                            <Tooltip
                                cursor={{ fill: '#f3f4f6' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="value" fill="#16a34a" radius={[0, 4, 4, 0]} barSize={32} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Gender Distribution (Full Width) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-gray-900">Distribusi Gender</h3>
                </div>
                <div className="h-[100px] flex items-center justify-center gap-12">
                    {employeeStats.gender.map((item, index) => (
                        <div key={item.name} className="flex flex-col items-center">
                            <div className={`text-3xl font-black ${item.name === 'Laki-laki' ? 'text-blue-600' : 'text-pink-600'}`}>
                                {item.value}
                            </div>
                            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-1">
                                {item.name}
                            </div>
                            <div className={`h-2 w-24 mt-3 rounded-full ${item.name === 'Laki-laki' ? 'bg-blue-100' : 'bg-pink-100'}`}>
                                <div
                                    className={`h-full rounded-full ${item.name === 'Laki-laki' ? 'bg-blue-600' : 'bg-pink-600'}`}
                                    style={{ width: `${(item.value / (employeeStats.gender[0].value + employeeStats.gender[1].value)) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
