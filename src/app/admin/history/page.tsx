import { getEmployees } from "@/lib/employees";
import { getDocumentsByEmployee, EmployeeDocument } from "@/lib/history";
import { getPositions } from "@/lib/positions";
import { HistoryManagement } from "@/components/HistoryManagement";

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
    const employees = await getEmployees();
    const positions = await getPositions();

    // Get all documents - handle case where table might not exist yet
    let flatDocuments: EmployeeDocument[] = [];
    try {
        const allDocuments = await Promise.all(
            employees.map(emp => getDocumentsByEmployee(emp.id))
        );
        flatDocuments = allDocuments.flat();
    } catch (error) {
        console.error("Error loading documents:", error);
        // Return empty array if table doesn't exist yet
    }

    return <HistoryManagement employees={employees} initialDocuments={flatDocuments} positions={positions} />;
}
