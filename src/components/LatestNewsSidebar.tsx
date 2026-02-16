import Link from "next/link";
import { getNews } from "@/lib/news";
import { Calendar, ChevronRight } from "lucide-react";

export async function LatestNewsSidebar() {
    const allNews = await getNews();
    const latestNews = allNews
        .filter((item) => item.status === "Published")
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    return (
        <aside className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <span className="w-1.5 h-6 bg-green-600 rounded-full mr-3"></span>
                    Berita Terbaru
                </h3>

                <div className="space-y-6">
                    {latestNews.map((news) => (
                        <Link key={news.id} href={`/news/${news.id}`} className="group block">
                            <div className="flex gap-4">
                                <div className="relative w-20 h-20 flex-shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={news.image}
                                        alt={news.title}
                                        className="w-full h-full object-cover rounded-lg group-hover:opacity-80 transition-opacity"
                                    />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <div className="flex items-center text-[10px] text-gray-400 font-medium mb-1 uppercase tracking-wider">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {news.date}
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-green-600 transition-colors">
                                        {news.title}
                                    </h4>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <Link
                    href="/news"
                    className="mt-8 flex items-center justify-center w-full py-3 text-sm font-bold text-green-600 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group"
                >
                    Lihat Semua
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="bg-green-700 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative group">
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <h3 className="text-xl font-bold mb-3 relative z-10">DKPP Indramayu</h3>
                <p className="text-green-100 text-sm mb-6 relative z-10">
                    Mewujudkan kedaulatan pangan dan kesejahteraan petani di Kabupaten Indramayu.
                </p>
                <Link
                    href="/profil"
                    className="inline-block px-6 py-2 bg-white text-green-700 text-sm font-bold rounded-full hover:bg-green-50 transition-colors relative z-10"
                >
                    Tentang Kami
                </Link>
            </div>
        </aside>
    );
}
