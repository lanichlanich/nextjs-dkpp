import { Newspaper, Users, Briefcase, TrendingUp, Clock } from "lucide-react";
import { getNews } from "@/lib/news";
import Link from "next/link";

export default async function DashboardPage() {
    const news = await getNews();

    // Calculate stats
    const totalNews = news.length;
    const publishedNews = news.filter(item => item.status === "Published").length;
    const draftNews = news.filter(item => item.status === "Draft").length;
    const archivedNews = news.filter(item => item.status === "Archived").length;

    // Calculate Publication Ratio
    const publicationRatio = totalNews > 0 ? Math.round((publishedNews / totalNews) * 100) : 0;

    // Get recent activities (last 5 news items, sorted by date/id)
    const recentActivities = [...news]
        .sort((a, b) => b.id.localeCompare(a.id))
        .slice(0, 5);

    const stats = [
        { name: 'Total Berita', value: totalNews.toString(), icon: Newspaper, change: 'Semua Status', changeType: 'neutral' },
        { name: 'Berita Terbit', value: publishedNews.toString(), icon: TrendingUp, change: 'Published', changeType: 'positive' },
        { name: 'Draft/Arsip', value: (draftNews + archivedNews).toString(), icon: Clock, change: 'Pending', changeType: 'neutral' },
        { name: 'Rasio Publikasi', value: `${publicationRatio}%`, icon: Briefcase, change: 'Efektivitas', changeType: 'positive' },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <item.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                                        <dd className="flex items-baseline">
                                            <div className="text-2xl font-semibold text-gray-900">{item.value}</div>
                                            <div className={`ml-2 flex items-baseline text-sm font-semibold 
                        ${item.changeType === 'positive' ? 'text-green-600' :
                                                    item.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'}`}>
                                                {item.change}
                                            </div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Aktivitas Terakhir</h2>
                    <div className="flow-root">
                        <ul className="-my-5 divide-y divide-gray-200">
                            {recentActivities.map((item) => (
                                <li key={item.id} className="py-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {item.title}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Status: {item.status} • {item.date}
                                            </p>
                                        </div>
                                        <div>
                                            <Link
                                                href={`/admin/news/${item.id}/edit`}
                                                className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Edit
                                            </Link>
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {recentActivities.length === 0 && (
                                <li className="py-4 text-center text-gray-500 text-sm">
                                    Belum ada aktivitas berita.
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
