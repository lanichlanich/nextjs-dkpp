import { getSettings } from "@/lib/settings";
import { SettingsManagement } from "@/components/SettingsManagement";
import { Settings, ShieldAlert } from "lucide-react";
import { verifyRole } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
    const isAdmin = await verifyRole("Admin");
    if (!isAdmin) {
        redirect("/admin/dashboard");
    }

    const settings = await getSettings();

    return (
        <div className="p-4 md:p-8">
            <div className="mb-10">
                <div className="flex items-center text-green-600 mb-2">
                    <Settings className="w-5 h-5 mr-2 animate-spin-slow" />
                    <span className="font-bold tracking-wider uppercase text-sm">System Control Center</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase italic">
                            Pengaturan <span className="text-green-600 underline decoration-green-200 underline-offset-8">Akses</span>
                        </h1>
                        <p className="text-gray-500 mt-4 max-w-2xl text-lg font-medium leading-relaxed">
                            Pusat kendali hak akses peranan pengguna. Tentukan fitur mana saja yang dapat dioperasikan oleh akun Pegawai.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-6 py-3 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded-2xl shadow-sm">
                        <ShieldAlert className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-tight">Admin Only Area</span>
                    </div>
                </div>
            </div>

            <SettingsManagement initialSettings={settings} />
        </div>
    );
}
