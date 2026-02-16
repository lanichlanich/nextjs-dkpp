"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown, Scale, ShoppingCart } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isMobilePriceOpen, setIsMobilePriceOpen] = useState(false);

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

            {/* Harga Pangan Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setIsPriceOpen(true)}
              onMouseLeave={() => setIsPriceOpen(false)}
            >
              <button
                className="flex items-center gap-1 text-gray-700 hover:text-green-600 transition-colors font-medium h-16"
                onClick={() => setIsPriceOpen(!isPriceOpen)}
              >
                Harga Pangan
                <ChevronDown size={14} className={`transition-transform duration-200 ${isPriceOpen ? 'rotate-180' : ''}`} />
              </button>

              {isPriceOpen && (
                <div className="absolute left-0 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl py-3 z-50 transition-all">
                  <Link href="/harga/sayuran" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 font-bold transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                      <ShoppingCart size={16} />
                    </div>
                    Harga Sayuran
                  </Link>
                  <Link href="/harga/buah" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 font-bold transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                      <ShoppingCart size={16} />
                    </div>
                    Harga Buah-buahan
                  </Link>
                </div>
              )}
            </div>

            <Link href="/jdih" className="text-gray-700 hover:text-green-600 transition-colors font-medium flex items-center gap-1">
              JDIH
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

            {/* Mobile Harga Pangan */}
            <div>
              <button
                onClick={() => setIsMobilePriceOpen(!isMobilePriceOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50"
              >
                Harga Pangan
                <ChevronDown size={18} className={`transition-transform ${isMobilePriceOpen ? 'rotate-180' : ''}`} />
              </button>
              {isMobilePriceOpen && (
                <div className="pl-6 space-y-1 mt-1 transition-all">
                  <Link
                    href="/harga/sayuran"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-green-600 hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    • Harga Sayuran
                  </Link>
                  <Link
                    href="/harga/buah"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-green-600 hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    • Harga Buah-buahan
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/jdih"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              JDIH
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
