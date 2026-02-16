import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { ServiceCard } from "@/components/ServiceCard";
import { Sprout, Tractor, Wheat, Users, ArrowRight } from "lucide-react";
import { getNews } from "@/lib/news";
import Link from "next/link";
import { MotionWrapper } from "@/components/MotionWrapper";
import { YouTubeVideos } from "@/components/YouTubeVideos";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const allNews = await getNews();
  const publishedNews = allNews.filter(item => item.status === "Published");
  const latestNews = publishedNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);

  const services = [
    {
      title: "Ketersediaan dan Distribusi Pangan",
      description: "Memastikan ketersediaan bahan pangan pokok dan kelancaran distribusi ke seluruh wilayah.",
      image: "/images/bidang/ketersediaan.png",
    },
    {
      title: "Konsumsi dan Keamanan Pangan",
      description: "Pengawasan kualitas dan keamanan pangan untuk konsumsi masyarakat yang sehat dan bergizi.",
      image: "/images/bidang/konsumsi.png",
    },
    {
      title: "Tanaman Pangan",
      description: "Pengembangan produksi komoditas tanaman pangan utama seperti padi dan palawija.",
      image: "/images/bidang/tanaman.png",
    },
    {
      title: "Hortikultura, Perkebunan & Penyuluhan",
      description: "Peningkatan kualitas hasil hortikultura, perkebunan, dan pendampingan penyuluh pertanian.",
      image: "/images/bidang/hortikultura.png",
    },
    {
      title: "Produksi Peternakan",
      description: "Optimasi hasil produksi sektor peternakan untuk mendukung swasembada pangan protein.",
      image: "/images/bidang/peternakan.png",
    },
    {
      title: "Keswan & Kesmavet",
      description: "Pelayanan kesehatan hewan dan pengawasan kesehatan masyarakat veteriner secara menyeluruh.",
      image: "/images/bidang/kesehatan.png",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Navbar />

      <main>
        <Hero />

        {/* Services Section */}
        <section id="services" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionWrapper direction="down" className="text-center mb-16">
            <span className="text-green-600 font-bold tracking-widest uppercase text-sm mb-2 block">Layanan Kami</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Bidang yang Dilayani</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Fokus utama Dinas Ketahanan Pangan dan Pertanian Kabupaten Indramayu dalam melayani masyarakat.
            </p>
          </MotionWrapper>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} delay={index * 0.1} />
            ))}
          </div>
        </section>

        {/* YouTube Section */}
        <YouTubeVideos />

        {/* News Section */}
        <section id="news" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <MotionWrapper direction="down" className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Berita Terbaru</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Informasi terkini kegiatan dan agrikultur di Indramayu.
              </p>
            </MotionWrapper>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestNews.map((item, index) => (
                <MotionWrapper key={item.id} direction="up" delay={index * 0.1 + 0.2}>
                  <Link href={`/news/${item.id}`} className="group block h-full">
                    <article className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover-lift transition-soft flex flex-col h-full">
                      <div className="relative h-48 w-full overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <span className="text-sm text-green-600 font-semibold">{item.date}</span>
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
            <MotionWrapper direction="up" delay={0.5} className="mt-12 text-center">
              <Link href="/news" className="inline-block px-8 py-3 border border-green-600 text-green-600 font-medium rounded-md hover:bg-green-50 hover-lift shadow-sm">
                Lihat Semua Berita
              </Link>
            </MotionWrapper>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
