import { getAgricultureProductions } from "@/lib/agriculture";
import { AgricultureManagement } from "@/components/AgricultureManagement";
import { Sprout } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSektoralPage() {
    const data = await getAgricultureProductions();

    return (
        <div className="p-4 md:p-8">
            <div className="mb-8">
                <div className="flex items-center text-green-600 mb-2">
                    <Sprout className="w-5 h-5 mr-2" />
                    <span className="font-bold tracking-wider uppercase text-sm">Statistik Sektoral</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                            Data <span className="text-green-600">Sektoral Pertanian</span>
                        </h1>
                        <p className="text-gray-600 mt-2 max-w-2xl">
                            Kelola data produksi pertanian, produktivitas, dan luas panen komoditas di wilayah Kabupaten Indramayu.
                        </p>
                    </div>
                </div>
            </div>

            <AgricultureManagement initialData={data} />
        </div>
    );
}
