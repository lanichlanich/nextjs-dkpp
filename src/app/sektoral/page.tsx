import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AgriculturePublicDashboard } from "@/components/AgriculturePublicDashboard";
import { getAgricultureProductions } from "@/lib/agriculture";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Statistik Sektoral Pertanian | DKPP Kabupaten Indramayu",
    description: "Halaman resmi portal data sektoral ketahanan pangan, pertanian, produktivitas, dan luas panen komoditas Kabupaten Indramayu.",
    openGraph: {
        title: "Statistik Sektoral Pertanian | DKPP Kabupaten Indramayu",
        description: "Halaman resmi portal data sektoral ketahanan pangan, pertanian, produktivitas, dan luas panen komoditas Kabupaten Indramayu.",
        type: "website",
    }
};

export default async function SektoralDashboardPage() {
    const data = await getAgricultureProductions();

    return (
        <div className="min-h-screen bg-slate-50/30 flex flex-col justify-between font-sans antialiased text-slate-800">
            <Navbar />
            
            <main className="flex-grow">
                <AgriculturePublicDashboard initialData={data} />
            </main>

            <Footer />
        </div>
    );
}
