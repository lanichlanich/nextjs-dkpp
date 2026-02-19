"use server";

import prisma from "@/lib/prisma";
import { getEmployeeById } from "@/lib/employees";
import { readFile } from "fs/promises";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

// Removed unused internal terbilang function. Using values passed from client.

export async function generateKgbWordAction(employeeId: string, kgbData: any) {
    try {
        const employee = await getEmployeeById(employeeId);
        if (!employee) throw new Error("Pegawai tidak ditemukan");

        // Load the template
        const templatePath = path.join(process.cwd(), "public", "draft template sk kgb.docx");
        const content = await readFile(templatePath);

        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            delimiters: { start: "<<", end: ">>" }
        });

        // Prepare data for template based on XML analysis
        const data = {
            tanggal: kgbData.tanggalSkFormatted || "-", // Indramayu, <<tanggal>>
            NAMA: employee.name,
            "tanggal lahir": employee.birthDate,
            nip: employee.nip,
            pangkat: kgbData.pangkat || "-",
            gol: employee.golongan,
            "gaji lama": kgbData.gajiPokokLamaFormatted,
            terbilang: kgbData.terbilangLama || "-",
            "pejabat sk lama": kgbData.pejabatSkLama,
            "tgl sk lama": kgbData.tanggalSkLamaFormatted,
            "no sk lama": kgbData.nomorSkLama,
            "tgl berlaku sk lama": kgbData.tglBerlakuSkLamaFormatted,
            "masa kerja sk lama": kgbData.masaKerjaSkLama,
            "gaji baru": kgbData.gajiPokokBaruFormatted,
            "terbilan gaji baru": kgbData.terbilangBaru || "-",
            "masa kerja sk baru": kgbData.masaKerjaSkBaru,
            "tgl berlaku sk baru": kgbData.tmtKgbFormatted,
            "kenaikan gaji akan datang": kgbData.kenaikanGajiAkanDatangFormatted,
            "status pegawai": employee.status,
        };

        doc.render(data);

        const buf = doc.getZip().generate({
            type: "nodebuffer",
            compression: "DEFLATE",
        });

        // Return as base64 to be handled by client
        return {
            success: true,
            fileName: `SK_KGB_${employee.name.replace(/\s+/g, '_')}.docx`,
            content: buf.toString('base64')
        };
    } catch (error: any) {
        console.error("Error generating KGB Word:", error);
        return { error: error.message || "Gagal membuat dokumen Word" };
    }
}
