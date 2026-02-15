import Link from "next/link";

export function Hero() {
    return (
        <div className="relative bg-green-800 text-white overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-20 bg-[url('/images/hero-bg.png')] bg-cover bg-center"></div>
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                    Ketahanan Pangan untuk <br />
                    <span className="text-green-300">Indramayu Reang</span>
                </h1>
                <p className="text-lg md:text-xl max-w-2xl mb-10 text-gray-100">
                    Mewujudkan kedaulatan pangan dan kesejahteraan petani melalui inovasi teknologi dan pelayanan prima.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href="#services"
                        className="px-8 py-3 rounded-full bg-white text-green-800 font-bold hover:bg-gray-100 transition-colors shadow-lg"
                    >
                        Layanan Kami
                    </Link>
                    <Link
                        href="/profil"
                        className="px-8 py-3 rounded-full bg-green-600 text-white font-bold hover:bg-green-700 transition-colors shadow-lg"
                    >
                        Profil Kami
                    </Link>
                    <Link
                        href="#contact"
                        className="px-8 py-3 rounded-full bg-transparent border-2 border-white text-white font-bold hover:bg-white/10 transition-colors"
                    >
                        Hubungi Kami
                    </Link>
                </div>
            </div>
        </div>
    );
}
