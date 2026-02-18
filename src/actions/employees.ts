"use server";

import { saveEmployee, deleteEmployee, Employee } from "@/lib/employees";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveEmployeeAction(data: Partial<Employee>) {
    try {
        const result = await saveEmployee(data);
        revalidatePath("/admin/employees");
        return result;
    } catch (error: any) {
        return { error: error.message || "Gagal menyimpan data pegawai" };
    }
}

export async function deleteEmployeeAction(id: string) {
    try {
        await deleteEmployee(id);
        revalidatePath("/admin/employees");
        return true;
    } catch (error: any) {
        return { error: error.message || "Gagal menghapus data pegawai" };
    }
}

export async function importEmployeesAction(data: (Partial<Employee> & { namaJabatan?: string })[]) {
    try {
        const results = await Promise.all(
            data.map(async (emp) => {
                let positionId = emp.positionId;

                // If position name is provided, try to find the position
                if (emp.namaJabatan && !positionId) {
                    const positions = await (prisma as any).position.findMany({
                        where: {
                            namaJabatan: {
                                equals: emp.namaJabatan,
                                mode: 'insensitive' // Case-insensitive match
                            }
                        }
                    });

                    if (positions.length > 0) {
                        positionId = positions[0].id;
                    }
                }

                return saveEmployee({
                    ...emp,
                    positionId
                });
            })
        );
        revalidatePath("/admin/employees");
        return { success: true, count: results.length };
    } catch (error: any) {
        return { error: error.message || "Gagal mengimpor data pegawai" };
    }
}

export async function bulkUpdateEmployeesAction(ids: string[], data: Partial<Employee>) {
    try {
        await prisma.$transaction(
            ids.map(id => (prisma as any).employee.update({
                where: { id },
                data
            }))
        );
        revalidatePath("/admin/employees");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Gagal memperbarui data pegawai secara massal" };
    }
}
