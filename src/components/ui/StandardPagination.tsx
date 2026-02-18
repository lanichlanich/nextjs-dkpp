"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface StandardPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
    color?: "blue" | "green";
}

export function StandardPagination({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage,
    color = "blue"
}: StandardPaginationProps) {
    if (totalPages <= 1) return null;

    const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
    const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
        const pages = [];
        const overflow = 2; // Pages to show around current page

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > overflow + 2) pages.push("ellipsis-1");

            const start = Math.max(2, currentPage - overflow);
            const end = Math.min(totalPages - 1, currentPage + overflow);

            for (let i = start; i <= end; i++) pages.push(i);

            if (currentPage < totalPages - overflow - 1) pages.push("ellipsis-2");
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="px-6 py-4 bg-white border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold text-gray-400 order-2 sm:order-1">
                Menampilkan <span className="text-gray-900">{totalItems === 0 ? 0 : indexOfFirstItem + 1}</span> - <span className="text-gray-900">{indexOfLastItem}</span> dari <span className="text-gray-900">{totalItems}</span> data
            </p>

            <nav className="flex items-center gap-1 order-1 sm:order-2" aria-label="Pagination">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-600 shadow-sm"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, i) => {
                        if (typeof page === "string") {
                            return (
                                <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-gray-400">
                                    <MoreHorizontal className="w-4 h-4" />
                                </span>
                            );
                        }

                        return (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all shadow-sm ${currentPage === page
                                    ? (color === "green" ? "bg-green-600 text-white shadow-green-100" : "bg-blue-600 text-white shadow-blue-100")
                                    : "text-gray-500 hover:bg-gray-50 border border-transparent hover:border-gray-100"
                                    }`}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-600 shadow-sm"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </nav>
        </div>
    );
}
