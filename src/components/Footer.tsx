export function Footer() {
    return (
        <footer className="bg-gray-900 text-white pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-green-400">DKPP Indramayu</h3>
                        <p className="text-gray-400 mb-4">
                            Dinas Ketahanan Pangan dan Pertanian Kabupaten Indramayu. Mengabdi untuk ketahanan pangan dan kesejahteraan petani.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-green-400">Tautan Cepat</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Beranda</a></li>
                            <li><a href="#services" className="hover:text-white transition-colors">Layanan</a></li>
                            <li><a href="#news" className="hover:text-white transition-colors">Berita</a></li>
                            <li><a href="#contact" className="hover:text-white transition-colors">Hubungi Kami</a></li>
                        </ul>
                    </div>
                    <div id="contact">
                        <h3 className="text-xl font-bold mb-4 text-green-400">Kontak Kami</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li>Jl. Contoh No. 123, Indramayu</li>
                            <li>Jawa Barat, Indonesia</li>
                            <li>Email: info@dkpp-indramayu.go.id</li>
                            <li>Telp: (0234) 123456</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Dinas Ketahanan Pangan dan Pertanian Kabupaten Indramayu. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
