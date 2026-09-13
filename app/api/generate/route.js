import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { success: false, error: 'GEMINI_API_KEY belum dikonfigurasi di Vercel Environment Variables.' },
        { status: 500 }
      );
    }

    const { character, themeEnglish, themeLabelIndo, enableWatermark, creatorCode } = await req.json();

    // 1. FILTER ANTI-PORNOGRAFI / NSFW
    const forbiddenKeywords = ['telanjang', 'nude', 'naked', 'seks', 'porn', 'vulgar', 'bikini', 'topless'];
    const isViolating = forbiddenKeywords.some(word => 
      character.toLowerCase().includes(word) || (themeEnglish && themeEnglish.toLowerCase().includes(word))
    );

    if (isViolating) {
      return Response.json(
        { success: false, error: 'Input terdeteksi melanggar kebijakan konten (Anti-Pornografi/NSFW).' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Menggunakan gemini-1.5-flash untuk stabilitas & quota limit yang lebih baik
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    // 2. PROMPT TUNGGAL (Menghemat Kuota API 50% & Menerjemahkan Istilah Lokal Seperti Keris secara Akurat)
    const combinedSystemPrompt = `
      Anda adalah ahli perancang prompt visual AI dan budayawan Nusantara.
      Analisis subjek: "${character}" dengan tema visual: "${themeEnglish}".

      TUGAS UTAMA VISUAL:
      1. Jika "${character}" adalah objek budaya Indonesia (seperti Keris, Angklung, Candi, Gamelan), terjemahkan ke bentuk fisik visual spesifik dalam Bahasa Inggris. 
         Contoh: Keris -> "traditional Indonesian wavy-bladed dagger with intricate carved wooden hilt and steel blade".
      2. Tentukan apakah subjek ini BENDA MATI / SEJARAH / LANDSKAP atau TOKOH MANUSIA.
         - Jika BENDA MATI / SENJATA: SANGAT DILARANG menampilkan gelas, sedotan, atau produk rumah tangga. Fokuskan HANYA pada fisik objek tersebut secara megah. STRICTLY NO PEOPLE, NO HUMAN, NO GLASS, NO STRAW.
         - Jika TOKOH MANUSIA: Berpakaian sangat sopan, elegan, dan menutup aurat (modest attire, fully clothed).

      Hasilkan output JSON dengan format persis berikut:
      {
        "isObject": true,
        "category": "INANIMATE_OBJECT",
        "generatedPrompt": "A highly detailed cinematic 8k render of [jelaskan fisik ${character} secara spesifik dalam bahasa inggris], rendered in ${themeEnglish}, masterpiece, studio lighting, highly detailed texture",
        "traits": [
          {"category": "Gaya Visual", "value": "${themeLabelIndo || 'Klasik/Futuristik'}"},
          {"category": "Klasifikasi", "value": "Senjata Tradisional / Objek"},
          {"category": "Aura / Lighting", "value": "Pencahayaan Artistik Dimensi Mythic"},
          {"category": "Detail Ornamen", "value": "Ukiran Khas Nusantara"}
        ],
        "rarityScore": 99.1,
        "storyTitle": "Naskah & Latar Belakang Mitologi ${character}",
        "storyScript": "Penjelasan naratif imersif menceritakan filosofi, keunikan, serta kekuatan legenda dari ${character}.",
        "audioAtmosphere": "Gamelan misterius dipadukan dengan dentang besi mistis"
      }
    `;

    const response = await model.generateContent(combinedSystemPrompt);
    let resultText = response.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(resultText);

    // Prompt Gambar Bahasa Inggris yang Sangat Spesifik
    let safePrompt = `${result.generatedPrompt}`;
    if (result.isObject) {
      safePrompt += `, detailed view, center focus, high detail heritage artifact, no human, no woman, no glass, no straw`;
    }
    
    const encodedImagePrompt = encodeURIComponent(safePrompt);
    const randomSeed = Math.floor(Math.random() * 999999);
    
    result.imageUrl = `https://image.pollinations.ai/prompt/${encodedImagePrompt}?width=1024&height=1024&nologo=true&seed=${randomSeed}`;
    result.audioUrl = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=cyberpunk-ambient-114319.mp3';

    // 3. WATERMARK PROVENANCE & KODE CREATOR
    if (enableWatermark) {
      const timestamp = new Date().toISOString();
      const creatorText = creatorCode ? creatorCode.trim() : 'Ful21';
      const rawPayload = `${character}|${themeEnglish}|${creatorText}|${timestamp}`;
      const digitalSignature = crypto.createHash('sha256').update(rawPayload).digest('hex');

      result.watermark = {
        enabled: true,
        digitalSignature: `NCH-PROV-${digitalSignature.substring(0, 14).toUpperCase()}`,
        fullHash: digitalSignature,
        creatorCode: creatorText,
        timestamp: timestamp
      };
    } else {
      result.watermark = { enabled: false };
    }

    return Response.json({ success: true, data: result });
  } catch (error) {
    console.error('Error Generating Content:', error);

    // Menampilkan pesan error yang lebih bersih jika terkena Rate Limit API
    let errorMessage = error.message || 'Gagal memproses AI';
    if (errorMessage.includes('429') || errorMessage.includes('Quota exceeded')) {
      errorMessage = 'Batas penggunaan gratis Gemini API tercapai (Rate Limit). Silakan tunggu 1 menit lalu coba klik tombol Generate lagi.';
    }

    return Response.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
