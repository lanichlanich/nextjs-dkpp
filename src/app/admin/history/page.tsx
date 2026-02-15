import { getEmployees } from "@/lib/employees";
import { getAllDocuments, EmployeeDocument } from "@/lib/history";
import { getPositions } from "@/lib/positions";
import { HistoryManagement } from "@/components/HistoryManagement";

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
    const employees = await getEmployees();
    const positions = await getPositions();

    // Get all documents in a single efficient query
    let flatDocuments: EmployeeDocument[] = [];
    try {
        flatDocuments = await getAllDocuments();
    } catch (error) {
        console.error("Error loading documents:", error);
    }

    return <HistoryManagement employees={employees} initialDocuments={flatDocuments} positions={positions} />;
}
