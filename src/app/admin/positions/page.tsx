import { getPositions } from "@/lib/positions";
import { PositionManagement } from "@/components/PositionManagement";

export default async function PositionsPage() {
    const positions = await getPositions();

    return <PositionManagement initialPositions={positions} />;
}
