import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getNewsById } from "@/lib/news";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";

export const revalidate = 60;

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const newsItem = await getNewsById(id);

    if (!newsItem || newsItem.status !== "Published") {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
            <Navbar />

            <main className="flex-grow py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <Link href="/news" className="inline-flex items-center text-green-600 hover:text-green-800 mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali ke Berita
                </Link>

                <article className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="relative w-full h-64 md:h-96">
                        <Image
                            src={newsItem.image}
                            alt={newsItem.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    <div className="p-8">
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                            <Calendar className="w-4 h-4 mr-2" />
                            {newsItem.date}
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                            {newsItem.title}
                        </h1>

                        <div
                            className="prose prose-green prose-lg max-w-none text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: newsItem.content }}
                        />
                    </div>
                </article>
            </main>

            <Footer />
        </div>
    );
}
