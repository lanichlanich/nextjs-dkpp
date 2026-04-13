"use server";

import prisma from "@/lib/prisma";
import { getEmployeeById } from "@/lib/employees";
import { readFile } from "fs/promises";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export async function generateDpcpWordAction(employeeId: string, dpcpData: any) {
    try {
        const employee = await getEmployeeById(employeeId);
        if (!employee) throw new Error("Pegawai tidak ditemukan");

        // Load the template
        const templatePath = path.join(process.cwd(), "public", "format-dpcp.docx");
        const content = await readFile(templatePath);

        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            delimiters: { start: "<<", end: ">>" }
        });

        // Prepare data for template based on the exact XML keys from format-dpcp.docx
        const data = {
            "58 TAHUN": dpcpData.batasUsiaPensiun || "-",
            "NININ NURWULAN, S.Sos": employee.name,
            "196803261994032008": employee.nip,
            "YOGYAKARTA, 26 MARET 1968": dpcpData.ttl || "-",
            "KEPALA BIDANG KETERSEDIAAN DAN DISTRIBUSI PANGAN": employee.position?.namaJabatan || "-",
            "PEMBINA / IV/A": dpcpData.pangkatGolongan || "-",
            "5.235.000": dpcpData.gajiPokok || "-",
            "29 TAHUN, 1 BULAN – 01 MARET 2023": dpcpData.masaKerja || "-",
            "32 TAHUN 00 BULAN": dpcpData.masaKerjaGolongan || "-",
            "00 TAHUN 00 BULAN": dpcpData.masaKerjaTambahan || "-",
            "11 APRIL 1994": dpcpData.tmtCpns || "-",
            "Drs. H. SUGENG HERYANTO, M.Si": dpcpData.namaPejabat || "-",
        };

        doc.render(data);

        const buf = doc.getZip().generate({
            type: "nodebuffer",
            compression: "DEFLATE",
        });

        return {
            success: true,
            fileName: `DPCP_${employee.name.replace(/\s+/g, '_')}.docx`,
            content: buf.toString('base64')
        };
    } catch (error: any) {
        console.error("Error generating DPCP Word:", error);
        return { error: error.message || "Gagal membuat dokumen Word" };
    }
}
