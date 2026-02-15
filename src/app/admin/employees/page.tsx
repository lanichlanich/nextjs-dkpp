import { getEmployees } from "@/lib/employees";
import { getPositions } from "@/lib/positions";
import { EmployeeManagement } from "@/components/EmployeeManagement";
import { Briefcase } from "lucide-react";

export default async function AdminEmployeesPage() {
    const employees = await getEmployees();
    const positions = await getPositions();

    return (
        <div className="p-4 md:p-8">
            <div className="mb-8">
                <div className="flex items-center text-green-600 mb-2">
                    <Briefcase className="w-5 h-5 mr-2" />
                    <span className="font-bold tracking-wider uppercase text-sm">Kepegawaian</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                            Daftar <span className="text-green-600">Pegawai</span>
                        </h1>
                        <p className="text-gray-600 mt-2 max-w-2xl">
                            Kelola data pegawai DKPP Indramayu. NIP akan otomatis mengidentifikasi tanggal lahir dan jenis kelamin.
                        </p>
                    </div>
                </div>
            </div>

            <EmployeeManagement initialEmployees={employees} positions={positions} />
        </div>
    );
}
