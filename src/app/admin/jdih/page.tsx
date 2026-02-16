import { getJdihDocuments } from "@/lib/jdih";
import { JdihManagement } from "@/components/JdihManagement";
import { Scale } from "lucide-react";

export default async function AdminJdihPage() {
    const documents = await getJdihDocuments();

    return (
        <div className="p-4 md:p-8">
            <div className="mb-8">
                <div className="flex items-center text-blue-600 mb-2">
                    <Scale className="w-5 h-5 mr-2" />
                    <span className="font-bold tracking-wider uppercase text-sm">Hukum & JDIH</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                            Dokumentasi <span className="text-blue-600">Hukum</span>
                        </h1>
                        <p className="text-gray-600 mt-2 max-w-2xl">
                            Kelola Jaringan Dokumentasi dan Informasi Hukum (JDIH) DKPP Indramayu. Publikasi produk hukum daerah secara transparan.
                        </p>
                    </div>
                </div>
            </div>

            <JdihManagement initialDocuments={documents} />
        </div>
    );
}
