"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Newspaper,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    UserCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MotionWrapper } from "@/components/MotionWrapper";
import { getSettingsAction } from "@/actions/settings";
import { getSessionAction, logoutAction } from "@/actions/auth";
import { SystemSettings } from "@/lib/settings";
import { SessionData } from "@/lib/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [currentUser, setCurrentUser] = useState<SessionData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const [session, settingsData] = await Promise.all([
                    getSessionAction(),
                    getSettingsAction()
                ]);

                if (!session) {
                    router.push("/login");
                } else {
                    setCurrentUser(session);
                    setSettings(settingsData);
                }
            } catch (error) {
                console.error("Auth init error:", error);
                router.push("/login");
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, [router]);

    const handleLogout = async () => {
        await logoutAction();
        router.push("/login");
    };

    if (isLoading || !currentUser) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    const navigation = [
        {
            name: "Dashboard",
            href: "/admin/dashboard",
            icon: LayoutDashboard,
            show: true
        },
        {
            name: "Berita",
            href: "/admin/news",
            icon: Newspaper,
            show: currentUser.role === "Admin" || (settings?.Pegawai.canManageNews)
        },
        {
            name: "Pengguna",
            href: "/admin/users",
            icon: Users,
            show: currentUser.role === "Admin" || (settings?.Pegawai.canManageUsers)
        },
        {
            name: "Pengaturan",
            href: "/admin/settings",
            icon: Settings,
            show: currentUser.role === "Admin"
        },
    ];

    const visibleNavigation = navigation.filter(item => item.show !== false);

    return (
        <div className="min-h-screen bg-gray-100 flex overflow-hidden">
            {/* Mobile sidebar backdrop */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    ></motion.div>
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-green-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                <div className="flex items-center justify-between h-16 px-6 bg-green-800">
                    <span className="text-xl font-bold tracking-wider">DKPP Admin</span>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <nav className="mt-5 px-3 space-y-2">
                    {visibleNavigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                                    group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                                    ${isActive ? "bg-green-700 text-white shadow-lg" : "text-green-100 hover:bg-green-800 hover:text-white"}
                                `}
                            >
                                <item.icon className={`mr-4 h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="absolute bottom-0 w-full p-4 border-t border-green-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-green-100 hover:bg-red-700 hover:text-white transition-colors"
                    >
                        <LogOut className="mr-4 h-5 w-5" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden text-gray-500 focus:outline-none"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-sm font-bold text-gray-900">{currentUser.name}</span>
                                <span className="text-xs text-green-600 font-semibold uppercase">{currentUser.role}</span>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center text-green-800 shadow-sm overflow-hidden">
                                <UserCircle className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <MotionWrapper direction="up" delay={0.1}>
                        {children}
                    </MotionWrapper>
                </main>
            </div>
        </div>
    );
}
