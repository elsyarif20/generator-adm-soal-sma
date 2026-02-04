
import { GoogleGenAI, Modality, Type, GenerateContentResponse } from "@google/genai";
import { FormData, GeneratedSection, GroundingSource } from "../types";

// Helper function to safely get the AI client
const getAiClient = (): GoogleGenAI => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
};

// Audio decoding helpers
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const sectionsSchema = {
    type: Type.OBJECT,
    properties: {
        sections: {
            type: Type.ARRAY,
            description: "An array of generated document sections.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "Unique identifier for the section." },
                    title: { type: Type.STRING, description: "The title of the generated section." },
                    content: { type: Type.STRING, description: "The full HTML content of the section." },
                },
                required: ['id', 'title', 'content'],
            },
        },
    },
    required: ['sections'],
};

const cleanAndParseJson = (text: string): any => {
    if (!text) throw new Error("Respon AI kosong.");
    let cleanText = text.trim();
    cleanText = cleanText.replace(/```json|```/g, '');
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }
    try {
        return JSON.parse(cleanText);
    } catch (e) {
        throw new Error("Gagal memproses format data dari AI.");
    }
};

const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> => {
    try {
        return await fn();
    } catch (error: any) {
        if (retries > 0 && (error.toString().toLowerCase().includes('503') || error.toString().toLowerCase().includes('unavailable'))) {
            await new Promise(res => setTimeout(res, delay));
            return withRetry(fn, retries - 1, delay * 2);
        }
        throw error;
    }
};

export const getCPSuggestions = async (formData: Partial<FormData>): Promise<string> => {
    const ai = getAiClient();
    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Buat daftar Elemen Capaian Pembelajaran (CP) untuk mata pelajaran ${formData.mata_pelajaran}, jenjang ${formData.jenjang}, kelas ${formData.kelas}, fase ${formData.fase}. Sajikan dalam format Markdown.`,
    }));
    return response.text;
};

export const getTopicSuggestions = async (formData: Partial<FormData>): Promise<string> => {
    const ai = getAiClient();
    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Berikan daftar ide Topik/Materi Pembelajaran yang relevan untuk mata pelajaran ${formData.mata_pelajaran}, jenjang ${formData.jenjang}, kelas ${formData.kelas} untuk semester ${formData.semester}. Jika ini untuk Try Out, berikan materi spesifik Kelas 12 saja yang sering keluar di ujian akhir sekolah. Sajikan dalam format Markdown.`,
    }));
    return response.text;
};

export const generateAdminContent = async (formData: FormData): Promise<GeneratedSection[]> => {
    const ai = getAiClient();
    const harakatInstruction = formData.bahasa === 'Bahasa Arab' 
        ? "**INSTRUKSI KHUSUS BAHASA ARAB: Seluruh teks Arab WAJIB MENGGUNAKAN HARAKAT LENGKAP.**"
        : "";
    const mathInstruction = "**FORMAT MATEMATIKA PENTING:** Jika menuliskan rumus atau angka berpangkat, WAJIB menggunakan superscript Unicode (seperti x², m³, 10⁻⁴). JANGAN GUNAKAN simbol caret (^).";

    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Anda adalah asisten ahli guru. Buat dokumen administrasi Kurikulum Merdeka.
        **Data:** ${formData.mata_pelajaran}, Kelas ${formData.kelas}, Fase ${formData.fase}, CP: ${formData.cp_elements}.
        Tugas: Generate ATP, Prota, Promes, Modul Ajar, KKTP, dan Jurnal Harian dalam format JSON.
        ${harakatInstruction}
        ${mathInstruction}
        Gunakan tag '<table>' untuk semua dokumen.`,
        config: {
            responseMimeType: 'application/json',
            responseSchema: sectionsSchema,
            temperature: 0.7,
            ...(formData.use_thinking_mode && { thinkingConfig: { thinkingBudget: 32768 } })
        }
    }));

    const result = cleanAndParseJson(response.text);
    return result.sections;
};

export const generateSoalContentSections = async (formData: FormData): Promise<GeneratedSection[]> => {
    const ai = getAiClient();
    const mathInstruction = "**FORMAT MATEMATIKA PENTING:** Gunakan superscript Unicode (x², m³, 10⁻⁴) untuk pangkat. JANGAN GUNAKAN simbol caret (^).";

    const formattingInstruction = `
    **ATURAN TATA LETAK & FORMAT HTML (WAJIB DIPATUHI):**
    1. Gunakan tag HTML yang valid untuk semua struktur.
    2. **FORMAT SOAL:** Gunakan tag \`<ol>\` (Ordered List) sebagai pembungkus utama soal. Setiap butir soal harus berada di dalam tag \`<li>\`.
    3. **JANGAN MENULIS NOMOR SECARA MANUAL.** Jangan menulis "1. Pertanyaan...", tapi tulislah \`<li>Pertanyaan...</li>\`. Biarkan browser yang memberikan nomor otomatis.
    4. **FORMAT PILIHAN GANDA:** Di dalam \`<li>\` soal, opsi jawaban (A, B, C, D, E) **WAJIB** menggunakan nested list \`<ol type="A">\`. 
       Contoh struktur yang BENAR:
       \`<ol> <li> Pertanyaan soal disini? <ol type="A"> <li>Opsi satu</li> <li>Opsi dua</li> </ol> </li> </ol>\`
    5. **KUNCI JAWABAN:** Sajikan dalam tabel HTML (\`<table>\`).
    `;

    const jmlPg = Number(formData.jumlah_pg) || 0;
    const jmlUraian = Number(formData.jumlah_uraian) || 0;
    
    // TKA Configuration
    const includeTka = !!formData.sertakan_soal_tka;
    const jmlPgTka = includeTka ? (Number(formData.jumlah_soal_tka) || 0) : 0;
    const jmlUraianTka = includeTka ? (Number(formData.jumlah_soal_tka_uraian) || 0) : 0;
    
    const harakatInstruction = formData.bahasa === 'Bahasa Arab' 
        ? "Seluruh teks Arab WAJIB MENGGUNAKAN HARAKAT LENGKAP."
        : "";

    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Anda adalah pembuat soal profesional. Buat Bank Soal lengkap.
        **Data:** ${formData.mata_pelajaran}, Kelas ${formData.kelas}, Topik: ${formData.topik_materi}.
        
        ${formattingInstruction}
        ${mathInstruction}
        ${harakatInstruction}

        Tugas detail:
        1. Kisi-kisi Soal (Tabel).
        2. Naskah Soal Pilihan Ganda (Total ${jmlPg + jmlPgTka} butir). Ini harus berisi ${jmlPg} soal standar dan ${jmlPgTka} soal TKA/HOTS. Gabungkan semuanya menjadi satu daftar berurutan. Gunakan struktur HTML <ol> untuk soal dan <ol type="A"> untuk opsi jawaban.
        3. Naskah Soal Uraian (Total ${jmlUraian + jmlUraianTka} butir). Ini harus berisi ${jmlUraian} soal standar dan ${jmlUraianTka} soal TKA/HOTS. Gabungkan semuanya menjadi satu daftar berurutan. Gunakan struktur HTML <ol>.
        4. Kunci Jawaban & Pedoman Penskoran (Tabel).
        `,
        config: {
            responseMimeType: 'application/json',
            responseSchema: sectionsSchema,
            temperature: 0.7,
            ...(formData.use_thinking_mode && { thinkingConfig: { thinkingBudget: 32768 } })
        }
    }));

    const result = cleanAndParseJson(response.text);
    return result.sections;
};

export const generateTryoutContent = async (formData: FormData): Promise<GeneratedSection[]> => {
    const ai = getAiClient();
    const mathInstruction = "**FORMAT MATEMATIKA PENTING:** Gunakan superscript Unicode (x², m³, 10⁻⁴) untuk pangkat. JANGAN GUNAKAN simbol caret (^).";
    
    const formattingInstruction = `
    **ATURAN TATA LETAK (WAJIB):**
    1. Gunakan tag \`<ol>\` untuk daftar soal agar penomoran otomatis.
    2. Gunakan tag \`<ol type="A">\` untuk opsi jawaban Pilihan Ganda agar huruf (A, B, C, D, E) otomatis.
    3. JANGAN tulis nomor/huruf manual (Contoh salah: "1. Soal"). Gunakan \`<li>Soal</li>\`.
    `;

    const jmlPg = Number(formData.jumlah_pg) || 0;
    const jmlUraian = Number(formData.jumlah_uraian) || 0;
    const jmlPgTka = Number(formData.jumlah_soal_tka) || 0;
    const jmlUraianTka = Number(formData.jumlah_soal_tka_uraian) || 0;

    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Anda adalah pembuat soal Ujian Sekolah. Buat paket Try Out UAS Kelas 12.
        **Materi:** ${formData.topik_materi}.
        **Kelompok:** ${formData.kelompok_tka}.

        ${formattingInstruction}
        ${mathInstruction}

        Tugas:
        1. Kisi-kisi (Tabel).
        2. Naskah Soal Pilihan Ganda (Total ${jmlPg + jmlPgTka} butir). Gabungkan ${jmlPg} soal standar dan ${jmlPgTka} soal TKA Akademik - ${formData.kelompok_tka} menjadi satu daftar berurutan. Soal TKA harus HOTS/Setara UTBK. Gunakan struktur HTML <ol> dan <ol type="A">.
        3. Naskah Soal Uraian (Total ${jmlUraian + jmlUraianTka} butir). Gabungkan ${jmlUraian} soal standar dan ${jmlUraianTka} soal TKA Akademik - ${formData.kelompok_tka} menjadi satu daftar berurutan. Gunakan struktur HTML <ol>.
        4. Kunci Jawaban Lengkap (Tabel).`,
        config: {
            responseMimeType: 'application/json',
            responseSchema: sectionsSchema,
            temperature: 0.7,
            ...(formData.use_thinking_mode && { thinkingConfig: { thinkingBudget: 32768 } })
        }
    }));

    const result = cleanAndParseJson(response.text);
    return result.sections;
};

export const generateSuperContent = async (formData: FormData, textContent: string): Promise<GeneratedSection[]> => {
    const ai = getAiClient();
    const harakatInstruction = formData.bahasa === 'Bahasa Arab' 
        ? "**INSTRUKSI KHUSUS BAHASA ARAB: Seluruh teks Arab WAJIB MENGGUNAKAN HARAKAT LENGKAP.**"
        : "";
    const mathInstruction = "**FORMAT MATEMATIKA PENTING:** Jika menuliskan rumus atau angka berpangkat, WAJIB menggunakan superscript Unicode (seperti x², m³, 10⁻⁴). JANGAN GUNAKAN simbol caret (^).";
    
    const formattingInstruction = `
    **ATURAN TATA LETAK & FORMAT HTML (WAJIB DIPATUHI):**
    1. Gunakan tag HTML yang valid untuk semua struktur.
    2. **FORMAT SOAL:** Gunakan tag \`<ol>\` (Ordered List) sebagai pembungkus utama soal. Setiap butir soal harus berada di dalam tag \`<li>\`.
    3. **JANGAN MENULIS NOMOR SECARA MANUAL.** Jangan menulis "1. Pertanyaan...", tapi tulislah \`<li>Pertanyaan...</li>\`. Biarkan browser yang memberikan nomor otomatis.
    4. **FORMAT PILIHAN GANDA:** Di dalam \`<li>\` soal, opsi jawaban (A, B, C, D, E) **WAJIB** menggunakan nested list \`<ol type="A">\`. 
       Contoh struktur yang BENAR:
       \`<ol> <li> Pertanyaan soal disini? <ol type="A"> <li>Opsi satu</li> <li>Opsi dua</li> </ol> </li> </ol>\`
    5. **KUNCI JAWABAN:** Sajikan dalam tabel HTML (\`<table>\`).
    `;

    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Anda adalah asisten ahli guru yang sangat canggih. Berdasarkan teks buku ajar yang disediakan, buat DUA jenis dokumen secara bersamaan dalam satu output JSON:
1.  **Dokumen Administrasi Kurikulum Merdeka Lengkap:** ATP, Prota, Promes, 1 Modul Ajar representatif, KKTP, dan Jurnal Harian.
2.  **Bank Soal Lengkap:** Kisi-kisi Soal, 15 Soal Pilihan Ganda (opsi A-E), 5 Soal Uraian, dan Kunci Jawaban beserta Pedoman Penskoran.

**Data Kontekstual:**
- Mata Pelajaran: ${formData.mata_pelajaran}
- Kelas: ${formData.kelas}
- Semester: ${formData.semester}
- Sekolah: ${formData.sekolah}
- Guru: ${formData.nama_guru}
- Tahun Ajaran: ${formData.tahun_ajaran}

**Teks Buku Ajar untuk dianalisis:**
"""
${textContent}
"""

**ATURAN KETAT (WAJIB DIPATUHI):**
- Format output HARUS JSON.
- Gunakan tag \`<table>\` untuk semua dokumen tabel (ATP, Prota, Promes, Kisi-kisi, Kunci Jawaban).
- ${formattingInstruction}
- ${mathInstruction}
- ${harakatInstruction}`,
        config: {
            responseMimeType: 'application/json',
            responseSchema: sectionsSchema,
            temperature: 0.7,
            ...(formData.use_thinking_mode && { thinkingConfig: { thinkingBudget: 32768 } })
        }
    }));

    const result = cleanAndParseJson(response.text);
    return result.sections;
};

export const groundedSearch = async (query: string, tool: 'web' | 'maps', location?: {latitude: number, longitude: number}): Promise<{ text: string, sources: GroundingSource[] }> => {
    const ai = getAiClient();
    let tools: any[] = [];
    let toolConfig: any = {};

    if (tool === 'web') {
        tools = [{ googleSearch: {} }];
    } else if (tool === 'maps') {
        tools = [{ googleMaps: {} }];
        if (location) {
             toolConfig = {
                retrievalConfig: {
                    latLng: {
                        latitude: location.latitude,
                        longitude: location.longitude
                    }
                }
             };
        }
    }

    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: tool === 'maps' ? 'gemini-2.5-flash' : 'gemini-3-flash-preview',
        contents: query,
        config: {
            tools: tools,
            ...(tool === 'maps' ? { toolConfig } : {})
        }
    }));

    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    chunks.forEach((chunk: any) => {
        if (chunk.web) {
            sources.push({ uri: chunk.web.uri, title: chunk.web.title });
        } else if (chunk.maps) { // Corrected from map to maps based on documentation if needed, but SDK usually returns maps in chunks differently. Checking documentation structure.
             // Usually for maps grounding chunks might be different, but for now assuming standard grounding structure
             // If maps provides specific structure, adapt here.
             // Based on instruction: groundingChunks.maps.uri
             if (chunk.maps) {
                sources.push({ uri: chunk.maps.uri || '', title: chunk.maps.title || 'Google Maps Result' });
             }
        }
    });

    return {
        text: response.text || "Maaf, tidak dapat menemukan informasi.",
        sources: sources
    };
};

export const textToSpeech = async (text: string): Promise<AudioBuffer> => {
    const ai = getAiClient();
    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    }));

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Gagal menghasilkan audio.");

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        audioContext,
        24000,
        1
    );
    return audioBuffer;
};

export const generateImage = async (prompt: string): Promise<string> => {
    const ai = getAiClient();
    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: prompt,
        config: {
             // responseMimeType not supported for this model
        }
    }));
    
    // Iterate to find image part
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error("Tidak ada gambar yang dihasilkan.");
};

export const editImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    const ai = getAiClient();
    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data: base64Image, mimeType: mimeType } },
                { text: prompt }
            ]
        }
    }));

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error("Gagal mengedit gambar.");
};

export const analyzeImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    const ai = getAiClient();
    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash', // Using flash for analysis
        contents: {
            parts: [
                 { inlineData: { data: base64Image, mimeType: mimeType } },
                 { text: prompt }
            ]
        }
    }));
    return response.text || "Tidak ada analisis.";
};

export const generateVideo = async (prompt: string, image?: { imageBytes: string, mimeType: string } | null, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<any> => {
    const ai = getAiClient();
    
    // Veo needs strict config
    const config: any = {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
    };

    let params: any = {
        model: 'veo-3.1-fast-generate-preview',
        config: config
    };

    if (image) {
        // Image-to-Video
        params.image = image;
        params.prompt = prompt || "Animate this image"; 
    } else {
        // Text-to-Video
        params.prompt = prompt;
    }

    const operation = await ai.models.generateVideos(params);
    return operation;
};

export const checkVideoOperation = async (operation: any): Promise<any> => {
     const ai = getAiClient();
     return await ai.operations.getVideosOperation({ operation: operation });
};

export const analyzeVideoFrames = async (frames: {data: string, mimeType: string}[], prompt: string): Promise<string> => {
    const ai = getAiClient();
    const parts: any[] = frames.map(frame => ({
        inlineData: {
            data: frame.data,
            mimeType: frame.mimeType
        }
    }));
    parts.push({ text: prompt });

    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: parts }
    }));
    return response.text || "Tidak ada hasil analisis.";
};
