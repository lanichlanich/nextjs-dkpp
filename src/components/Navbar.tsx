"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl text-green-700">DKPP Indramayu</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
              Beranda
            </Link>
            <Link href="/profil" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
              Profil
            </Link>
            <Link href="#services" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
              Layanan
            </Link>
            <Link href="#news" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
              Berita
            </Link>
            <Link href="#contact" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
              Kontak
            </Link>
            <Link href="/login" className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors font-medium">
              Login Pegawai
            </Link>
          </div>
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-green-600 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Beranda
            </Link>
            <Link
              href="/profil"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Profil
            </Link>
            <Link
              href="#services"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Layanan
            </Link>
            <Link
              href="#news"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Berita
            </Link>
            <Link
              href="#contact"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Kontak
            </Link>
            <Link
              href="/login"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Login Pegawai
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
