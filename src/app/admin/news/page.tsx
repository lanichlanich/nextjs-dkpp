import { getNews } from "@/lib/news";
import { NewsManagement } from "@/components/NewsManagement";
import { getSettings } from "@/lib/settings";

export default async function NewsPage() {
    const news = await getNews();
    const settings = await getSettings();

    // Mock role - matches AdminLayout
    const userRole = "Admin";
    const canManage = userRole === "Admin" || settings.Pegawai.canManageNews;

    return (
        <NewsManagement initialNews={news} canManage={canManage} />
    );
}
