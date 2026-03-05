import { getNews } from "@/lib/news";
import { NewsManagement } from "@/components/NewsManagement";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
    const news = await getNews();
    const settings = await getSettings();

    // Mock role - matches AdminLayout
    const userRole = "Admin";
    const canManage = userRole === "Admin" || settings.Pegawai.canManageNews;

    return (
        <NewsManagement initialNews={news} canManage={canManage} />
    );
}
