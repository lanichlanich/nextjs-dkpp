import { verifyRole, getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { getProfileData } from "@/lib/profile";
import { redirect } from "next/navigation";
import { ProfileManagement } from "@/components/ProfileManagement";

export default async function AdminProfilePage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const settings = await getSettings();
    const canManage = session.role === "Admin" || settings.Pegawai.canManageProfile;

    if (!canManage) {
        redirect("/admin/dashboard");
    }

    const initialData = await getProfileData();

    return (
        <div className="max-w-7xl mx-auto">
            <ProfileManagement initialData={initialData} />
        </div>
    );
}
