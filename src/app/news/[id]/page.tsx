import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getNewsById, getNews } from "@/lib/news";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Clock, ChevronRight, Share2 } from "lucide-react";
import { MotionWrapper } from "@/components/MotionWrapper";
import { SocialShare } from "@/components/SocialShare";
import { LatestNewsSidebar } from "@/components/LatestNewsSidebar";

export const revalidate = 60;

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const newsItem = await getNewsById(id);

    if (!newsItem || newsItem.status !== "Published") {
        notFound();
    }

    const allNews = await getNews();
    const relatedNews = allNews
        .filter(item => item.id !== id && item.status === "Published")
        .slice(0, 3);

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
            <Navbar />

            {/* Breadcrumbs & Header */}
            <div className="bg-gray-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <MotionWrapper direction="down" delay={0.1}>
                        <nav className="flex items-center text-sm text-gray-500 mb-6 font-medium">
                            <Link href="/" className="hover:text-green-600 transition-colors">Beranda</Link>
                            <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
                            <Link href="/news" className="hover:text-green-600 transition-colors">Berita</Link>
                            <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
                            <span className="text-gray-900 line-clamp-1">Detail Berita</span>
                        </nav>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-[1.15] mb-6">
                            {newsItem.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 font-medium">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3">
                                    <User className="w-4 h-4" />
                                </div>
                                <span>Admin DKPP</span>
                            </div>
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-green-600" />
                                {newsItem.date}
                            </div>
                            <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-green-600" />
                                5 Menit Baca
                            </div>
                        </div>
                    </MotionWrapper>
                </div>
            </div>

            <main className="flex-grow py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Main Content Area */}
                        <div className="lg:w-2/3">
                            <MotionWrapper direction="up" delay={0.2}>
                                {/* Hero Image */}
                                <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl mb-10 group">
                                    <Image
                                        src={newsItem.image}
                                        alt={newsItem.title}
                                        fill
                                        className="object-cover transform group-hover:scale-105 transition-transform duration-700"
                                        priority
                                    />
                                    <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-3xl"></div>
                                </div>

                                {/* Article Content */}
                                <div className="prose prose-xl prose-green max-w-none prose-img:rounded-3xl prose-headings:text-gray-950 prose-headings:font-black prose-p:text-gray-900 prose-p:leading-loose prose-li:text-gray-900 prose-li:leading-loose">
                                    <div dangerouslySetInnerHTML={{ __html: newsItem.content }} />
                                </div>

                                {/* Social Share */}
                                <SocialShare title={newsItem.title} url={`/news/${id}`} />

                                {/* Related News for Mobile (visible only on mobile) */}
                                <div className="lg:hidden mt-12 mb-8">
                                    <LatestNewsSidebar />
                                </div>

                                {/* Related News Footer section */}
                                <div className="mt-16 pt-12 border-t border-gray-100">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                                        Berita Lainnya
                                        <div className="ml-4 h-[2px] flex-grow bg-gray-100 italic"></div>
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {relatedNews.map((news) => (
                                            <Link key={news.id} href={`/news/${news.id}`} className="group block h-full">
                                                <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 h-full flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
                                                    <div className="relative aspect-[4/3]">
                                                        <Image
                                                            src={news.image}
                                                            alt={news.title}
                                                            fill
                                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <div className="p-5 flex-grow flex flex-col">
                                                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-2 block">
                                                            {news.date}
                                                        </span>
                                                        <h3 className="text-sm font-bold text-gray-900 line-clamp-3 leading-snug group-hover:text-green-600 transition-colors">
                                                            {news.title}
                                                        </h3>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </MotionWrapper>
                        </div>

                        {/* Sidebar (Desktop only) */}
                        <div className="hidden lg:block lg:w-1/3">
                            <MotionWrapper direction="up" delay={0.3} className="sticky top-24">
                                <LatestNewsSidebar />
                            </MotionWrapper>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
