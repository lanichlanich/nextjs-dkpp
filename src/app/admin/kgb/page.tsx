import { getEmployees } from "@/lib/employees";
import { KgbManagement } from "@/components/KgbManagement";
import { FileText } from "lucide-react";

export default async function AdminKgbPage() {
    const employees = await getEmployees();

    return (
        <div className="p-4 md:p-8">
            <div className="mb-8">
                <div className="flex items-center text-green-600 mb-2">
                    <FileText className="w-5 h-5 mr-2" />
                    <span className="font-bold tracking-wider uppercase text-sm">Administrasi</span>
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                        SK <span className="text-green-600">KGB</span>
                    </h1>
                    <p className="text-gray-600 mt-2 max-w-2xl">
                        Generate Surat Kenaikan Gaji Berkala (KGB) untuk pegawai DKPP Indramayu dalam format Word dan PDF.
                    </p>
                </div>
            </div>

            <KgbManagement employees={employees} />
        </div>
    );
}
