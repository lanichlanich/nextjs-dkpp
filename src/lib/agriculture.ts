import prisma from './prisma';

export interface AgricultureProduction {
    id: string;
    tahun: number;
    komoditas: string;
    produksi: number;
    produktivitas?: number | null;
    luasPanen?: number | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function getAgricultureProductions(): Promise<AgricultureProduction[]> {
    try {
        if (!prisma) {
            throw new Error("Prisma client is not initialized");
        }

        return await (prisma as any).agricultureProduction.findMany({
            orderBy: [
                { tahun: 'desc' },
                { komoditas: 'asc' }
            ]
        });
    } catch (error) {
        console.error("Error in getAgricultureProductions:", error);
        throw error;
    }
}

export async function getAgricultureProductionById(id: string): Promise<AgricultureProduction | null> {
    try {
        if (!prisma) {
            throw new Error("Prisma client is not initialized");
        }

        return await (prisma as any).agricultureProduction.findUnique({
            where: { id }
        });
    } catch (error) {
        console.error("Error in getAgricultureProductionById:", error);
        throw error;
    }
}

export async function saveAgricultureProduction(data: Partial<AgricultureProduction>) {
    try {
        if (!prisma) {
            throw new Error("Prisma client is not initialized");
        }

        const tahun = Number(data.tahun);
        const komoditas = data.komoditas || '';
        const produksi = Number(data.produksi);
        const produktivitas = data.produktivitas !== undefined && data.produktivitas !== null ? Number(data.produktivitas) : null;
        const luasPanen = data.luasPanen !== undefined && data.luasPanen !== null ? Number(data.luasPanen) : null;

        if (data.id) {
            return await (prisma as any).agricultureProduction.update({
                where: { id: data.id },
                data: {
                    tahun,
                    komoditas,
                    produksi,
                    produktivitas,
                    luasPanen
                }
            });
        }

        return await (prisma as any).agricultureProduction.create({
            data: {
                tahun,
                komoditas,
                produksi,
                produktivitas,
                luasPanen
            }
        });
    } catch (error) {
        console.error("Error in saveAgricultureProduction:", error);
        throw error;
    }
}

export async function deleteAgricultureProduction(id: string) {
    try {
        if (!prisma) {
            throw new Error("Prisma client is not initialized");
        }

        return await (prisma as any).agricultureProduction.delete({
            where: { id }
        });
    } catch (error) {
        console.error("Error in deleteAgricultureProduction:", error);
        throw error;
    }
}
