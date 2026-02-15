import prisma from './prisma';

export interface Employee {
    id: string;
    name: string;
    nip: string;
    birthPlace: string;
    gender: string;
    status: string;
    keaktifan: string;
    golongan: string;
    positionId?: string | null;
    createdAt: Date;
}

export interface EmployeeDisplay extends Employee {
    birthDate: string;
    birthDay: number;
    birthMonth: number;
    birthYear: number;
    position?: {
        id: string;
        namaJabatan: string;
        jenisJabatan: string;
        batasUsiaPensiun: number;
    } | null;
    retirementAge?: number;
    retirementYear?: number;
    isRetiringThisYear: boolean;
    tmtPensiun?: string;
}

export function parseNip(nip: string) {
    if (nip.length < 15) return null;

    const year = nip.substring(0, 4);
    const month = nip.substring(4, 6);
    const day = nip.substring(6, 8);
    const genderDigit = nip.charAt(14); // Index 14 is 15th char

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const birthDate = `${day} ${months[parseInt(month) - 1]} ${year}`;
    const gender = genderDigit === '1' ? 'Laki-laki' : 'Perempuan';

    return {
        birthDate,
        gender,
        birthDay: parseInt(day),
        birthMonth: parseInt(month),
        birthYear: parseInt(year)
    };
}

export function calculateRetirement(birthYear: number, birthMonth: number, birthDay: number, retirementAge: number) {
    const currentYear = new Date().getFullYear();
    const retirementYear = birthYear + retirementAge;
    const isRetiringThisYear = retirementYear === currentYear;

    // Calculate TMT Pensiun
    // Rule:
    // If born on 1st of month -> TMT is 1st of that month
    // If born on 2nd or later -> TMT is 1st of next month
    let tmtMonth = birthMonth;
    let tmtYear = retirementYear;

    if (birthDay > 1) {
        tmtMonth += 1;
        if (tmtMonth > 12) {
            tmtMonth = 1;
            tmtYear += 1;
        }
    }

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const tmtPensiun = `1 ${months[tmtMonth - 1]} ${tmtYear}`;

    return {
        retirementYear,
        isRetiringThisYear,
        tmtPensiun
    };
}

export async function getEmployees(): Promise<EmployeeDisplay[]> {
    try {
        if (!prisma) {
            throw new Error("Prisma client is not initialized (prisma is undefined)");
        }

        const client = prisma as any;
        if (!client.employee) {
            console.log("DEBUG: Prisma keys at failure:", Object.keys(client));
            throw new Error("Prisma model 'employee' is undefined on the client instance");
        }

        const employees = await client.employee.findMany({
            include: {
                position: true
            },
            orderBy: { name: 'asc' }
        });

        return (employees as any[]).map((emp: any) => {
            const parsed = parseNip(emp.nip);
            const birthYear = parsed?.birthYear || 0;
            const birthMonth = parsed?.birthMonth || 0;
            const birthDay = parsed?.birthDay || 0;
            const retirementAge = emp.position?.batasUsiaPensiun || 58;
            const retirement = calculateRetirement(birthYear, birthMonth, birthDay, retirementAge);

            return {
                ...emp,
                birthDate: parsed?.birthDate || '-',
                gender: emp.gender || (parsed?.gender as any) || '-',
                birthDay: birthDay,
                birthMonth: birthMonth,
                birthYear: birthYear,
                retirementAge: retirementAge,
                retirementYear: retirement.retirementYear,
                isRetiringThisYear: retirement.isRetiringThisYear,
                tmtPensiun: retirement.tmtPensiun
            };
        });
    } catch (error: any) {
        console.error("CRITICAL ERROR in getEmployees:", error);
        throw error;
    }
}

export async function getEmployeeById(id: string): Promise<EmployeeDisplay | null> {
    const emp = await (prisma as any).employee.findUnique({
        where: { id },
        include: {
            position: true
        }
    });

    if (!emp) return null;

    const parsed = parseNip(emp.nip);
    const birthYear = parsed?.birthYear || 0;
    const birthMonth = parsed?.birthMonth || 0;
    const birthDay = parsed?.birthDay || 0;
    const retirementAge = emp.position?.batasUsiaPensiun || 58;
    const retirement = calculateRetirement(birthYear, birthMonth, birthDay, retirementAge);

    return {
        ...emp,
        birthDate: parsed?.birthDate || '-',
        gender: emp.gender || (parsed?.gender as any) || '-',
        birthDay: birthDay,
        birthMonth: birthMonth,
        birthYear: birthYear,
        retirementAge: retirementAge,
        retirementYear: retirement.retirementYear,
        isRetiringThisYear: retirement.isRetiringThisYear,
        tmtPensiun: retirement.tmtPensiun
    };
}

export async function saveEmployee(data: Partial<Employee>) {
    if (data.id) {
        return await (prisma as any).employee.update({
            where: { id: data.id },
            data: {
                name: data.name,
                nip: data.nip,
                birthPlace: data.birthPlace,
                gender: data.gender,
                status: data.status,
                keaktifan: data.keaktifan,
                golongan: data.golongan,
                positionId: data.positionId || null
            }
        });
    }

    return await (prisma as any).employee.create({
        data: {
            name: data.name || '',
            nip: data.nip || '',
            birthPlace: data.birthPlace || '',
            gender: data.gender || 'Laki-laki',
            status: data.status || 'PNS',
            keaktifan: data.keaktifan || 'Aktif',
            golongan: data.golongan || '-',
            positionId: data.positionId || null
        }
    });
}

export async function deleteEmployee(id: string) {
    return await (prisma as any).employee.delete({
        where: { id }
    });
}
