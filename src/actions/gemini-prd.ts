"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { verifyRole } from "@/lib/auth";

export async function generatePrdAction(data: {
    projectName: string;
    description: string;
    targetAudience: string;
    features: string;
}) {
    if (!(await verifyRole("Admin"))) {
        throw new Error("Unauthorized: Hanya Admin yang dapat menggunakan fitur ini.");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY tidak ditemukan di environment variables.");
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Anda adalah seorang Product Manager Senior. Tugas Anda adalah membuat Product Requirements Document (PRD) yang sangat detail, profesional, dan terstruktur berdasarkan informasi berikut:

            Nama Proyek: ${data.projectName}
            Deskripsi/Latar Belakang: ${data.description}
            Target Pengguna: ${data.targetAudience}
            Fitur Utama: ${data.features}

            Gunakan bahasa Indonesia yang formal dan teknis. 
            Struktur PRD harus mencakup:
            1. Executive Summary
            2. Objectives & Business Value
            3. User Personas (Minimal 2)
            4. Functional Requirements (Sangat detail, pecah menjadi poin-poin)
            5. Non-Functional Requirements (Performance, Security, Reliability)
            6. UI/UX Considerations
            7. Success Metrics
            8. Roadmap Singkat

            Format output harus dalam Markdown yang rapi.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return { success: true, content: text };
    } catch (error: any) {
        console.error("Gemini PRD Error:", error);
        return { success: false, error: error.message || "Gagal menghasilkan PRD." };
    }
}
