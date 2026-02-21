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
            dasarHukum: JSON.parse(profile.dasarHukum || "[]") as string[],
            strukturOrganisasi: JSON.parse(profile.strukturOrganisasi || "{}") as any,
            uptd: JSON.parse(profile.uptd || "{}") as any,
            tugasFungsi: JSON.parse(profile.tugasFungsi || "[]") as string[],
            jabatanTataKerja: JSON.parse(profile.jabatanTataKerja || "[]") as string[]
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
    const stringifiedData = {
        dasarHukum: JSON.stringify(data.dasarHukum),
        strukturOrganisasi: JSON.stringify(data.strukturOrganisasi),
        uptd: JSON.stringify(data.uptd),
        tugasFungsi: JSON.stringify(data.tugasFungsi),
        jabatanTataKerja: JSON.stringify(data.jabatanTataKerja),
    };

    await prisma.profile.upsert({
        where: { id: 1 },
        update: stringifiedData,
        create: { id: 1, ...stringifiedData },
    });
}
