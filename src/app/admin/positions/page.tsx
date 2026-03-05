import { getPositions } from "@/lib/positions";
import { PositionManagement } from "@/components/PositionManagement";

export const dynamic = "force-dynamic";

export default async function AdminPositionsPage() {
    const positions = await getPositions();

    return <PositionManagement initialPositions={positions} />;
}
