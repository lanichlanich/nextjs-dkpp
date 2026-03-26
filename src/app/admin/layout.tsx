"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Newspaper,
    Users,
    Settings,
    Shield,
    LogOut,
    Menu,
    X,
    UserCircle,
    Briefcase,
    FileText,
    Scale,
    ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MotionWrapper } from "@/components/MotionWrapper";
import { getSettingsAction } from "@/actions/settings";
import { getSessionAction, logoutAction } from "@/actions/auth";
import { SystemSettings } from "@/lib/settings";
import { SessionData } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [currentUser, setCurrentUser] = useState<SessionData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPageLoading, setIsPageLoading] = useState(false);

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

    useEffect(() => {
        setIsPageLoading(true);
        const timer = setTimeout(() => setIsPageLoading(false), 500);
        return () => clearTimeout(timer);
    }, [pathname]);

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
            name: "Profil Dinas",
            href: "/admin/profile",
            icon: Shield,
            show: currentUser.role === "Admin" || (settings?.Pegawai.canManageProfile)
        },
        {
            name: "JDIH Hukum",
            href: "/admin/jdih",
            icon: Scale,
            show: currentUser.role === "Admin" || (settings?.Pegawai.canManageJdih)
        },
        {
            name: "Daftar Pegawai",
            href: "/admin/employees",
            icon: Briefcase,
            show: true
        },
        {
            name: "Daftar Jabatan",
            href: "/admin/positions",
            icon: Briefcase,
            show: true
        },
        {
            name: "SK KGB",
            href: "/admin/kgb",
            icon: FileText,
            show: true
        },
        {
            name: "Lapor SPT",
            href: "/admin/spt",
            icon: FileText,
            show: true
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
        <div className="min-h-screen bg-slate-50/50 flex overflow-hidden font-sans">
            <Toaster position="top-right" closeButton richColors />

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 shadow-sm z-30">
                <div className="flex items-center h-16 px-6 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600 text-white shadow-lg shadow-green-200">
                            <Shield className="h-5 w-5" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-slate-900">DKPP Admin</span>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
                    {visibleNavigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "group flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                                    isActive
                                        ? "bg-green-50 text-green-700 shadow-sm shadow-green-100/50"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <div className="flex items-center">
                                    <item.icon className={cn(
                                        "mr-3.5 h-4.5 w-4.5 transition-colors duration-200",
                                        isActive ? "text-green-600" : "text-slate-400 group-hover:text-slate-600"
                                    )} />
                                    {item.name}
                                </div>
                                {isActive && <ChevronRight className="h-3.5 w-3.5 text-green-600/50" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl px-3.5 py-6"
                    >
                        <LogOut className="mr-3.5 h-4.5 w-4.5" />
                        <span className="font-semibold text-sm">Keluar Sistem</span>
                    </Button>
                </div>
            </aside>

            {/* Main view container */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 lg:px-10">
                    <div className="flex items-center gap-4">
                        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                            <SheetTrigger
                                render={<Button variant="ghost" size="icon" className="md:hidden text-slate-600" />}
                            >
                                <Menu className="w-5 h-5" />
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-72 border-r-0">
                                <SheetHeader className="h-16 px-6 border-b border-slate-100 flex items-center justify-start text-left">
                                    <SheetTitle className="flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white shadow-md">
                                            <Shield className="h-4 w-4" />
                                        </div>
                                        <span className="text-base font-bold text-slate-900">DKPP Admin</span>
                                    </SheetTitle>
                                </SheetHeader>
                                <nav className="py-6 px-4 space-y-1.5 overflow-y-auto h-[calc(100vh-64px-80px)]">
                                    {visibleNavigation.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                onClick={() => setSidebarOpen(false)}
                                                className={cn(
                                                    "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all",
                                                    isActive
                                                        ? "bg-green-50 text-green-700 font-semibold"
                                                        : "text-slate-600 hover:bg-slate-50"
                                                )}
                                            >
                                                <item.icon className={cn("mr-3.5 h-5 w-5", isActive ? "text-green-600" : "text-slate-400")} />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </nav>
                                <div className="absolute bottom-0 w-full p-4 border-t border-slate-100 bg-white">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-red-600 hover:bg-red-50 py-6"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="mr-3 h-5 w-5" />
                                        Keluar
                                    </Button>
                                </div>
                            </SheetContent>
                        </Sheet>

                        <div className="hidden md:block">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Panel Admin</h2>
                            <p className="text-sm font-bold text-slate-900">DKPP Kabupaten Indramayu</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button variant="ghost" className="h-auto p-1 pr-3 rounded-full hover:bg-slate-100 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border-2 border-white ring-2 ring-slate-100 group-hover:ring-green-100 transition-all">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} />
                                                <AvatarFallback className="bg-green-100 text-green-700 font-bold uppercase">
                                                    {currentUser.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="hidden sm:flex flex-col items-start translate-y-[1px]">
                                                <span className="text-xs font-bold text-slate-900 leading-none mb-1">{currentUser.name}</span>
                                                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md font-black uppercase leading-none tracking-wider">
                                                    {currentUser.role}
                                                </span>
                                            </div>
                                        </div>
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl p-2 shadow-xl border-slate-200">
                                <DropdownMenuLabel className="px-2 py-2">
                                    <p className="text-xs font-medium text-slate-500">Akun Terhubung</p>
                                    <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-100" />
                                <DropdownMenuItem
                                    render={
                                        <Link href="/admin/profile" className="flex items-center gap-2.5 px-2 py-2.5 rounded-lg cursor-pointer transition-colors focus:bg-slate-50 focus:text-green-700" />
                                    }
                                >
                                    <UserCircle className="h-4 w-4 text-slate-400" />
                                    <span className="font-semibold text-sm">Profil Saya</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    render={
                                        <Link href="/admin/settings" className="flex items-center gap-2.5 px-2 py-2.5 rounded-lg cursor-pointer transition-colors focus:bg-slate-50 focus:text-green-700" />
                                    }
                                >
                                    <Settings className="h-4 w-4 text-slate-400" />
                                    <span className="font-semibold text-sm">Akun & Keamanan</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-100" />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="flex items-center gap-2.5 px-2 py-2.5 rounded-lg cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="font-bold text-sm">Log Out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar relative">
                    {/* Top Progress Bar */}
                    <AnimatePresence>
                        {isPageLoading && (
                            <motion.div
                                initial={{ scaleX: 0, opacity: 1 }}
                                animate={{ scaleX: 1, opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8, ease: "circInOut" }}
                                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-400 z-50 origin-left shadow-[0_1px_10px_rgba(34,197,94,0.3)]"
                            />
                        )}
                    </AnimatePresence>

                    <div className="max-w-[1600px] mx-auto w-full p-4 sm:p-6 lg:p-10">
                        <MotionWrapper direction="up" delay={0.05}>
                            {children}
                        </MotionWrapper>
                    </div>
                </main>
            </div>
        </div>
    );
}
