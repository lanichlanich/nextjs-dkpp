import { getEmployees } from "@/lib/employees";
import { DpcpManagement } from "@/components/DpcpManagement";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DpcpPage() {
    const employees = await getEmployees();

    return (
        <div className="p-4 md:p-8">
            <div className="mb-8">
                <div className="flex items-center text-blue-600 mb-2">
                    <FileText className="w-5 h-5 mr-2" />
                    <span className="font-bold tracking-wider uppercase text-sm">Administrasi</span>
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                        SK <span className="text-blue-600">DPCP</span>
                    </h1>
                    <p className="text-gray-600 mt-2 max-w-2xl">
                        Generate Data Perorangan Calon Penerima Pensiun (DPCP) Pegawai Negeri Sipil dalam format Word.
                    </p>
                </div>
            </div>

            <DpcpManagement employees={employees} />
        </div>
    );
}
