import prisma from './prisma';

export interface JdihDocument {
    id: string;
    title: string;
    type: string;
    number: string;
    year: string;
    description?: string | null;
    filePath?: string | null;
    fileName?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function getJdihDocuments(): Promise<JdihDocument[]> {
    try {
        if (!prisma) {
            throw new Error("Prisma client is not initialized");
        }

        return await (prisma as any).jdihDocument.findMany({
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("Error in getJdihDocuments:", error);
        throw error;
    }
}

export async function getJdihDocumentById(id: string): Promise<JdihDocument | null> {
    return await (prisma as any).jdihDocument.findUnique({
        where: { id }
    });
}

export async function saveJdihDocument(data: Partial<JdihDocument>) {
    if (data.id) {
        return await (prisma as any).jdihDocument.update({
            where: { id: data.id },
            data: {
                title: data.title,
                type: data.type,
                number: data.number,
                year: data.year,
                description: data.description,
                filePath: data.filePath,
                fileName: data.fileName,
            }
        });
    }

    return await (prisma as any).jdihDocument.create({
        data: {
            title: data.title || '',
            type: data.type || '',
            number: data.number || '',
            year: data.year || '',
            description: data.description || '',
            filePath: data.filePath || '',
            fileName: data.fileName || '',
        }
    });
}

export async function deleteJdihDocument(id: string) {
    return await (prisma as any).jdihDocument.delete({
        where: { id }
    });
}
