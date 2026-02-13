import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getNews } from "@/lib/news";
import Link from "next/link";
import { MotionWrapper } from "@/components/MotionWrapper";
import { ArrowRight, Calendar } from "lucide-react";

export const revalidate = 60;

export default async function NewsArchivePage() {
    const allNews = await getNews();
    const publishedNews = allNews.filter(item => item.status === "Published").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
            <Navbar />

            <main className="flex-grow py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <MotionWrapper direction="down" className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Berita & Informasi</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Kumpulan berita terkini seputar pertanian, pangan, dan kegiatan kedinasan.
                    </p>
                </MotionWrapper>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {publishedNews.map((item, index) => (
                        <MotionWrapper key={item.id} direction="up" delay={index * 0.1}>
                            <Link href={`/news/${item.id}`} className="group block h-full">
                                <article className="bg-white rounded-lg overflow-hidden shadow-md hover-lift transition-soft flex flex-col h-full">
                                    <div className="relative h-48 w-full overflow-hidden">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex items-center text-sm text-green-600 font-semibold mb-2">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            {item.date}
                                        </div>
                                        <h3 className="text-xl font-bold mt-2 mb-3 text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors">{item.title}</h3>
                                        <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">{item.excerpt}</p>
                                        <span className="text-green-700 font-medium group-hover:underline flex items-center mt-auto">
                                            Baca Selengkapnya <ArrowRight className="w-4 h-4 ml-1" />
                                        </span>
                                    </div>
                                </article>
                            </Link>
                        </MotionWrapper>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
