import prisma from './prisma';

export interface Position {
    id: string;
    namaJabatan: string;
    jenisJabatan: 'Struktural' | 'Fungsional' | 'Pelaksana';
    eselon?: string | null;
    jenjangFungsional?: string | null;
    jenisPelaksana?: string | null;
    batasUsiaPensiun: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface PositionInput {
    id?: string;
    namaJabatan: string;
    jenisJabatan: 'Struktural' | 'Fungsional' | 'Pelaksana';
    eselon?: string;
    jenjangFungsional?: string;
    jenisPelaksana?: string;
    batasUsiaPensiun: number;
}

export async function getPositions(): Promise<Position[]> {
    try {
        const positions = await (prisma as any).position.findMany({
            orderBy: [
                { jenisJabatan: 'asc' },
                { namaJabatan: 'asc' }
            ]
        });
        return positions;
    } catch (error: any) {
        console.error("Error fetching positions:", error);
        throw error;
    }
}

export async function getPositionById(id: string): Promise<Position | null> {
    try {
        const position = await (prisma as any).position.findUnique({
            where: { id }
        });
        return position;
    } catch (error: any) {
        console.error("Error fetching position:", error);
        throw error;
    }
}

export async function savePosition(data: PositionInput): Promise<Position> {
    try {
        if (data.id) {
            // Update existing position
            return await (prisma as any).position.update({
                where: { id: data.id },
                data: {
                    namaJabatan: data.namaJabatan,
                    jenisJabatan: data.jenisJabatan,
                    eselon: data.eselon || null,
                    jenjangFungsional: data.jenjangFungsional || null,
                    jenisPelaksana: data.jenisPelaksana || null,
                    batasUsiaPensiun: data.batasUsiaPensiun
                }
            });
        } else {
            // Create new position
            return await (prisma as any).position.create({
                data: {
                    namaJabatan: data.namaJabatan,
                    jenisJabatan: data.jenisJabatan,
                    eselon: data.eselon || null,
                    jenjangFungsional: data.jenjangFungsional || null,
                    jenisPelaksana: data.jenisPelaksana || null,
                    batasUsiaPensiun: data.batasUsiaPensiun
                }
            });
        }
    } catch (error: any) {
        console.error("Error saving position:", error);
        throw error;
    }
}

export async function deletePosition(id: string): Promise<void> {
    try {
        await (prisma as any).position.delete({
            where: { id }
        });
    } catch (error: any) {
        console.error("Error deleting position:", error);
        throw error;
    }
}
