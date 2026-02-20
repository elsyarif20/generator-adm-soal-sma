
import { GoogleGenAI, Modality, Type } from "@google/genai";

const getAiClient = () => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Audio decoding helpers
function decode(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data, ctx, sampleRate, numChannels) {
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

const cleanAndParseJson = (text) => {
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

const withRetry = async (fn, retries = 3, delay = 2000) => {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0 && (error.toString().toLowerCase().includes('503') || error.toString().toLowerCase().includes('unavailable'))) {
            await new Promise(res => setTimeout(res, delay));
            return withRetry(fn, retries - 1, delay * 2);
        }
        throw error;
    }
};

export const getCPSuggestions = async (formData) => {
    const ai = getAiClient();
    const response = await withRetry(() => ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Buat daftar Elemen Capaian Pembelajaran (CP) untuk mata pelajaran ${formData.mata_pelajaran}, jenjang ${formData.jenjang}, kelas ${formData.kelas}, fase ${formData.fase}. Sajikan dalam format Markdown.`,
    }));
    return response.text;
};

export const getTopicSuggestions = async (formData) => {
    const ai = getAiClient();
    const response = await withRetry(() => ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Berikan daftar ide Topik/Materi Pembelajaran yang relevan untuk mata pelajaran ${formData.mata_pelajaran}, jenjang ${formData.jenjang}, kelas ${formData.kelas} untuk semester ${formData.semester}. Jika ini untuk Try Out atau PSAJ, berikan materi spesifik yang sering keluar di ujian akhir jenjang. Sajikan dalam format Markdown.`,
    }));
    return response.text;
};

export const generateAdminContent = async (formData) => {
    const ai = getAiClient();
    const response = await withRetry(() => ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Anda adalah asisten ahli guru. Buat dokumen administrasi Kurikulum Merdeka.
        **Data:** ${formData.mata_pelajaran}, Kelas ${formData.kelas}, Fase ${formData.fase}, CP: ${formData.cp_elements}.
        Tugas: Generate ATP, Prota, Promes, Modul Ajar, KKTP, dan Jurnal Harian dalam format JSON.
        Gunakan tag '<table>' dengan border standar untuk semua dokumen. Dilarang menggunakan notasi Markdown (seperti ** atau #) di dalam teks.`,
        config: {
            responseMimeType: 'application/json',
            responseSchema: sectionsSchema,
            temperature: 0.7,
            thinkingConfig: { thinkingBudget: 32768 }
        }
    }));

    const result = cleanAndParseJson(response.text);
    return result.sections;
};

export const generateSoalContentSections = async (formData) => {
    const ai = getAiClient();
    const jmlPg = Number(formData.jumlah_pg) || 30;
    const jmlUraian = Number(formData.jumlah_uraian) || 5;

    const strictFormatting = `
    **INSTRUKSI KRITIKAL (WAJIB DIPATUHI):**
    1. **JUMLAH SOAL:** Kamu WAJIB menghasilkan TEPAT ${jmlPg} soal Pilihan Ganda (PG) dan TEPAT ${jmlUraian} soal Uraian. Jangan menghentikan output sebelum mencapai angka tersebut.
    2. **TIDAK ADA MARKDOWN:** DILARANG KERAS menggunakan simbol bintang dua (**), bintang satu (*), atau pagar (#) di dalam teks soal atau jawaban. Gunakan teks polos atau tag HTML <b> jika sangat perlu menebalkan.
    3. **TATA LETAK SOAL PG:** Gunakan <ol> untuk daftar soal. Opsi A-E WAJIB menggunakan <ol type="A" class="choices">. Jangan gunakan tag <p> atau <div> di dalam <li> agar spasi di Word rapat.
    4. **STRUKTUR DOKUMEN:** 
       - Section 1: Kisi-kisi (Tabel: No, Materi, Indikator, Level, Bentuk, No Soal).
       - Section 2: Naskah Soal (Gabungkan A. Pilihan Ganda dan B. Uraian di sini).
       - Section 3: Kunci Jawaban.
       - Section 4: Rubrik Penskoran.
       - Section 5: Analisis Kualitatif (Tabel: Aspek, Indikator, Ya/Tidak, Keterangan).
    `;

    const response = await withRetry(() => ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Buat paket asesmen lengkap untuk ${formData.mata_pelajaran}, Kelas ${formData.kelas}. Topik: ${formData.topik_materi}. 
        Kategori: ${formData.kategori_ujian}.
        
        ${strictFormatting}
        `,
        config: {
            responseMimeType: 'application/json',
            responseSchema: sectionsSchema,
            temperature: 0.5,
            thinkingConfig: { thinkingBudget: 32768 }
        }
    }));

    const result = cleanAndParseJson(response.text);
    return result.sections;
};

export const generateTryoutContent = async (formData) => {
    return generateSoalContentSections(formData);
};

export const generateSuperContent = async (formData, textContent) => {
    const ai = getAiClient();
    const response = await withRetry(() => ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Berdasarkan teks ini: """${textContent}""", buat Administrasi Guru dan Bank Soal Lengkap.
        Wajib menyertakan Tabel Kisi-kisi, Naskah Soal PG & Uraian (Gabung dalam satu section tanpa Markdown **), Kunci Jawaban, Rubrik, dan Analisis Kualitatif.
        Pastikan jumlah soal PG minimal 30 dan Uraian 5. Dilarang menggunakan bintang dua (**).`,
        config: {
            responseMimeType: 'application/json',
            responseSchema: sectionsSchema,
            temperature: 0.5,
            thinkingConfig: { thinkingBudget: 32768 }
        }
    }));

    const result = cleanAndParseJson(response.text);
    return result.sections;
};

export const groundedSearch = async (query, tool, location) => {
    const ai = getAiClient();
    let tools = [];
    let toolConfig = {};

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

    const response = await withRetry(() => ai.models.generateContent({
        model: tool === 'maps' ? 'gemini-2.5-flash' : 'gemini-3-flash-preview',
        contents: query,
        config: {
            tools: tools,
            ...(tool === 'maps' ? { toolConfig } : {})
        }
    }));

    const sources = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    chunks.forEach((chunk) => {
        if (chunk.web) {
            sources.push({ uri: chunk.web.uri, title: chunk.web.title });
        } else if (chunk.maps) {
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

export const textToSpeech = async (text) => {
    const ai = getAiClient();
    const response = await withRetry(() => ai.models.generateContent({
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

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        audioContext,
        24000,
        1
    );
    return audioBuffer;
};

export const generateImage = async (prompt) => {
    const ai = getAiClient();
    const response = await withRetry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: prompt,
        config: {}
    }));
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error("Tidak ada gambar yang dihasilkan.");
};

export const editImage = async (base64Image, mimeType, prompt) => {
    const ai = getAiClient();
    const response = await withRetry(() => ai.models.generateContent({
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

export const analyzeImage = async (base64Image, mimeType, prompt) => {
    const ai = getAiClient();
    const response = await withRetry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                 { inlineData: { data: base64Image, mimeType: mimeType } },
                 { text: prompt }
            ]
        }
    }));
    return response.text || "Tidak ada analisis.";
};

export const generateVideo = async (prompt, image, aspectRatio = '16:9') => {
    const ai = getAiClient();
    
    const config = {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
    };

    let params = {
        model: 'veo-3.1-fast-generate-preview',
        config: config
    };

    if (image) {
        params.image = image;
        params.prompt = prompt || "Animate this image"; 
    } else {
        params.prompt = prompt;
    }

    const operation = await ai.models.generateVideos(params);
    return operation;
};

export const checkVideoOperation = async (operation) => {
     const ai = getAiClient();
     return await ai.operations.getVideosOperation({ operation: operation });
};

export const analyzeVideoFrames = async (frames, prompt) => {
    const ai = getAiClient();
    const parts = frames.map(frame => ({
        inlineData: {
            data: frame.data,
            mimeType: frame.mimeType
        }
    }));
    parts.push({ text: prompt });

    const response = await withRetry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: parts }
    }));
    return response.text || "Tidak ada hasil analisis.";
};
