import prisma from './prisma';

export interface EmployeeDocument {
    id: string;
    employeeId: string;
    documentType: 'SK_CPNS' | 'SK_PNS' | 'SK_PPPK' | 'SKP' | 'SK_JABATAN' | 'PAKTA_INTEGRITAS';
    nomorSurat?: string | null;
    tanggalSurat?: Date | null;
    tanggalMulai?: Date | null;
    tahunSKP?: string | null;
    predikat?: string | null;
    positionId?: string | null;
    position?: {
        id: string;
        namaJabatan: string;
        jenisJabatan: string;
    } | null;
    filePath: string;
    fileName: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface DocumentInput {
    id?: string;
    employeeId: string;
    documentType: 'SK_CPNS' | 'SK_PNS' | 'SK_PPPK' | 'SKP' | 'SK_JABATAN' | 'PAKTA_INTEGRITAS';
    nomorSurat?: string;
    tanggalSurat?: Date;
    tanggalMulai?: Date;
    tahunSKP?: string;
    predikat?: string;
    positionId?: string;
    filePath: string;
    fileName: string;
}

/**
 * Get all employee documents from the database
 */
export async function getAllDocuments(): Promise<EmployeeDocument[]> {
    try {
        const documents = await prisma.employeeDocument.findMany({
            include: {
                position: {
                    select: {
                        id: true,
                        namaJabatan: true,
                        jenisJabatan: true
                    }
                }
            },
            orderBy: [
                { documentType: 'asc' },
                { tanggalSurat: 'desc' }
            ]
        });
        return documents as unknown as EmployeeDocument[];
    } catch (error: any) {
        console.error("Error fetching all documents:", error);
        throw error;
    }
}

export async function getDocumentsByEmployee(employeeId: string): Promise<EmployeeDocument[]> {
    try {
        const documents = await prisma.employeeDocument.findMany({
            where: { employeeId },
            include: {
                position: {
                    select: {
                        id: true,
                        namaJabatan: true,
                        jenisJabatan: true
                    }
                }
            },
            orderBy: [
                { documentType: 'asc' },
                { tanggalSurat: 'desc' }
            ]
        });
        return documents as unknown as EmployeeDocument[];
    } catch (error: any) {
        console.error("Error fetching documents:", error);
        throw error;
    }
}

export async function saveDocument(data: DocumentInput): Promise<EmployeeDocument> {
    try {
        let result: any;
        if (data.id) {
            // Update existing document
            result = await prisma.employeeDocument.update({
                where: { id: data.id },
                data: {
                    nomorSurat: data.nomorSurat || null,
                    tanggalSurat: data.tanggalSurat || null,
                    tanggalMulai: data.tanggalMulai || null,
                    tahunSKP: data.tahunSKP || null,
                    predikat: data.predikat || null,
                    positionId: data.positionId || null,
                    filePath: data.filePath,
                    fileName: data.fileName
                },
                include: {
                    position: true
                }
            });
        } else {
            // Create new document
            result = await prisma.employeeDocument.create({
                data: {
                    employeeId: data.employeeId,
                    documentType: data.documentType,
                    nomorSurat: data.nomorSurat || null,
                    tanggalSurat: data.tanggalSurat || null,
                    tanggalMulai: data.tanggalMulai || null,
                    tahunSKP: data.tahunSKP || null,
                    predikat: data.predikat || null,
                    positionId: data.positionId || null,
                    filePath: data.filePath,
                    fileName: data.fileName
                },
                include: {
                    position: true
                }
            });
        }

        // Sync employee position if this is an SK_JABATAN
        if (data.documentType === 'SK_JABATAN') {
            await syncEmployeePositionWithLatestSK(data.employeeId);
        }

        return result as EmployeeDocument;
    } catch (error: any) {
        console.error("Error saving document:", error);
        throw error;
    }
}

export async function deleteDocument(id: string): Promise<void> {
    try {
        // Get the document first to know the employeeId and type
        const doc = await getDocumentById(id);

        await prisma.employeeDocument.delete({
            where: { id }
        });

        // If we deleted an SK_JABATAN, we might need to re-sync
        if (doc && doc.documentType === 'SK_JABATAN') {
            await syncEmployeePositionWithLatestSK(doc.employeeId);
        }
    } catch (error: any) {
        console.error("Error deleting document:", error);
        throw error;
    }
}

export async function getDocumentById(id: string): Promise<EmployeeDocument | null> {
    try {
        const document = await prisma.employeeDocument.findUnique({
            where: { id },
            include: {
                position: true
            }
        });
        return document as unknown as EmployeeDocument;
    } catch (error: any) {
        console.error("Error fetching document:", error);
        throw error;
    }
}

export async function syncEmployeePositionWithLatestSK(employeeId: string): Promise<void> {
    try {
        // Find the SK_JABATAN with the latest TMT (tanggalMulai)
        const latestSK = await prisma.employeeDocument.findFirst({
            where: {
                employeeId,
                documentType: 'SK_JABATAN',
                positionId: { not: null }
            },
            orderBy: [
                { tanggalMulai: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        if (latestSK && latestSK.positionId) {
            // Update the employee's position
            await prisma.employee.update({
                where: { id: employeeId },
                data: { positionId: latestSK.positionId }
            });
        }
    } catch (error) {
        console.error("Error syncing employee position:", error);
        // Don't throw, just log. We don't want to break the document upload if this fails.
    }
}
