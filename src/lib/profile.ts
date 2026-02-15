import prisma from "./prisma";

export interface ProfileData {
    dasarHukum: string[];
    strukturOrganisasi: {
        pimpinan: string;
        sekretariat: string[];
        bidang: string[];
    };
    uptd: {
        kelasA: string[];
        kelasB: string[];
        nonStruktural: string[];
    };
    tugasFungsi: string[];
    jabatanTataKerja: string[];
}

export async function getProfileData(): Promise<ProfileData> {
    try {
        const profile = await prisma.profile.findUnique({
            where: { id: 1 }
        });

        if (!profile) {
            return {
                dasarHukum: [],
                strukturOrganisasi: { pimpinan: "", sekretariat: [], bidang: [] },
                uptd: { kelasA: [], kelasB: [], nonStruktural: [] },
                tugasFungsi: [],
                jabatanTataKerja: []
            };
        }

        return {
            dasarHukum: profile.dasarHukum as string[],
            strukturOrganisasi: profile.strukturOrganisasi as any,
            uptd: profile.uptd as any,
            tugasFungsi: profile.tugasFungsi as string[],
            jabatanTataKerja: profile.jabatanTataKerja as string[]
        };
    } catch (error) {
        console.error("Error reading profile data from DB:", error);
        return {
            dasarHukum: [],
            strukturOrganisasi: { pimpinan: "", sekretariat: [], bidang: [] },
            uptd: { kelasA: [], kelasB: [], nonStruktural: [] },
            tugasFungsi: [],
            jabatanTataKerja: []
        };
    }
}

export async function saveProfileData(data: ProfileData): Promise<void> {
    await prisma.profile.upsert({
        where: { id: 1 },
        update: data as any,
        create: { id: 1, ...data } as any,
    });
}
