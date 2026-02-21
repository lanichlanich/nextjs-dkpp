import { getSptReports } from "@/actions/spt";
import { SptManagement } from "@/components/SptManagement";
import { Suspense } from "react";

export const metadata = {
    title: "Manajemen SPT | DKPP Admin",
};

interface PageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
        year?: string;
    }>;
}

export default async function SptAdminPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const search = params.search || "";
    const year = params.year || "";

    const result = await getSptReports({
        page,
        limit: 10,
        search,
        year
    });

    if (!result.success) {
        return (
            <div className="p-8 bg-red-50 text-red-600 rounded-2xl border border-red-100">
                <h1 className="text-xl font-bold mb-2">Error</h1>
                <p>{result.error}</p>
            </div>
        );
    }

    return (
        <Suspense fallback={<div className="animate-pulse bg-gray-100 h-96 rounded-2xl" />}>
            <SptManagement
                initialReports={result.data || []}
                pagination={result.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 }}
            />
        </Suspense>
    );
}
