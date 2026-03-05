"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function AdminLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: "reverse"
                }}
                className="relative"
            >
                <div className="absolute inset-0 bg-green-200 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative bg-white p-6 rounded-3xl shadow-xl shadow-green-100/50 border border-green-50 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
                </div>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 text-center"
            >
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">Memuat Data</h3>
                <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-tighter">Mohon tunggu sebentar...</p>
                <div className="flex justify-center gap-1 mt-4">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 1, 0.3]
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2
                            }}
                            className="w-1.5 h-1.5 bg-green-500 rounded-full"
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
