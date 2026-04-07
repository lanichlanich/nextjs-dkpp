import { PrdGeneratorClient } from "@/components/PrdGeneratorClient";
import { getSessionAction } from "@/actions/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPrdPage() {
    const session = await getSessionAction();

    if (!session || session.role !== "Admin") {
        redirect("/admin/dashboard");
    }

    return (
        <PrdGeneratorClient />
    );
}
